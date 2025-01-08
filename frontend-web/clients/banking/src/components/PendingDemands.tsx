import React, {useCallback, useRef, useState} from 'react';
import { useMutation } from "@swan-io/graphql-client";
import {t} from "../utils/i18n";
import {
    InitiateSepaCreditTransfersDocument,
    TransactionDetailsFragment,
} from "../graphql/partner";
import {Router} from "../utils/routes";
import { filterRejectionsToResult } from "@swan-io/lake/src/utils/gql";
import { match } from "ts-pattern";
import { showToast } from "@swan-io/shared-business/src/state/toasts";
import { translateError } from "@swan-io/shared-business/src/utils/i18n";
import { EmptyView } from "@swan-io/lake/src/components/EmptyView";
import { commonStyles } from "@swan-io/lake/src/constants/commonStyles";
import { breakpoints } from "@swan-io/lake/src/constants/design";
import { FocusTrapRef } from "@swan-io/lake/src/components/FocusTrap";
import { ColumnConfig, PlainListView } from "@swan-io/lake/src/components/PlainListView";
import { ResponsiveContainer } from "@swan-io/lake/src/components/ResponsiveContainer";
import { HeaderCell } from "@swan-io/lake/src/components/Cells";
import { Cell } from "@swan-io/lake/src/components/Cells";
import { Space } from "@swan-io/lake/src/components/Space";
import { LakeHeading } from "@swan-io/lake/src/components/LakeHeading";
import { Tag } from "@swan-io/lake/src/components/Tag";
import {Pressable} from "react-native";



const columns: ColumnConfig<TransactionDetailsFragment, undefined>[] = [
    {
        id: "label",
        width: "grow",
        title: t("transactions.transaction"),
        renderTitle: ({ title }) => <HeaderCell text={title} />,
        renderCell: ({ item }) => <Cell>
            <LakeHeading variant="h5" level={3} numberOfLines={1}>
                {item.beneficiary.name}
            </LakeHeading>

            <>
                <Space width={16} />
                <Tag color="shakespear">{item.amount.value + ' ' + item.amount.currency}</Tag>
            </>
        </Cell>,
    }
];

export const PendingDemands = ({accountId, accountMembershipId}) => {

    const [initiateTransfers] = useMutation(InitiateSepaCreditTransfersDocument);

    const panelRef = useRef<FocusTrapRef | null>(null);

    const onActiveRowChange = useCallback(
        (element: HTMLElement) => panelRef.current?.setInitiallyFocusedElement(element),
        [],
    );

    const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);

    const handleInitiateTransfer = (value, currency, name, iban) => {
        initiateTransfers({
            input: {
                accountId,
                consentRedirectUrl:
                    window.location.origin + Router.AccountPaymentsRoot({ accountMembershipId }),
                creditTransfers: [{
                    amount: {
                        value,
                        currency,
                    },
                    mode: 'InstantWithFallback',
                    sepaBeneficiary: {
                        name,
                        save: false,
                        iban,
                        isMyOwnIban: false
                    }
                }],
            }
        }).mapOk(data => data.initiateCreditTransfers).mapOkToResult(filterRejectionsToResult)
            .tapOk(({ payment }) => {
                const status = payment.statusInfo;
                const params = { paymentId: payment.id, accountMembershipId };

                return match(status)
                    .with({ __typename: "PaymentInitiated" }, () => {
                        showToast({
                            variant: "success",
                            title: t("transfer.consent.success.title"),
                            description: t("transfer.consent.success.description"),
                            autoClose: false,
                        });
                        Router.replace("AccountTransactionsListRoot", params);
                    })
                    .with({ __typename: "PaymentRejected" }, () =>
                        showToast({
                            variant: "error",
                            title: t("transfer.consent.error.rejected.title"),
                            description: t("transfer.consent.error.rejected.description"),
                        }),
                    )
                    .with({ __typename: "PaymentConsentPending" }, ({ consent }) => {
                        window.location.assign(consent.consentUrl);
                    })
                    .exhaustive();
            })
            .tapError(error => {
                showToast({ variant: "error", error, title: translateError(error) });
            });
    }

    const data = {
        "__typename": "Query",
        "account": {
            "__typename": "Account",
            "id": "d789ef22-3848-49fd-aeb1-bf362e98ab16",
            "number": "28602927376",
            "name": "JoSeBu's Money",
            "transactions": {
                "__typename": "TransactionConnection",
                "pageInfo": {
                    "__typename": "PageInfo",
                    "endCursor": "MTczNjMyNzgxODA1Mzo6OmJvc2NpXzIyYjVjNDU5ZmNmMThhYzEyNGE4MDA1MWMxOGJmMGNm",
                    "hasNextPage": false
                },
                "edges": [
                    {
                        "__typename": "TransactionEdge",
                        "node": {
                            "id": "bosco_c1207bd934f8dd3c726f7486d4897974",
                            "amount": {
                                "__typename": "Amount",
                                "currency": "EUR",
                                "value": "50.00"
                            },
                            "createdAt": "2025-01-08T12:47:44.170Z",
                            "beneficiary": {
                                "name": "ERIKA",
                                "iban": "ES6411112222008763481670",
                            }
                        }
                    },
                    {
                        "__typename": "TransactionEdge",
                        "node": {
                            "id": "bosco_c1207bd934f8dd3c726f7486d4897974",
                            "amount": {
                                "__typename": "Amount",
                                "currency": "EUR",
                                "value": "1000.00"
                            },
                            "createdAt": "2025-01-08T12:47:44.170Z",
                            "beneficiary": {
                                "name": "ERIKINHO",
                                "iban": "ES6411112222008763481670",
                            }
                        }
                    },
                    {
                        "__typename": "TransactionEdge",
                        "node": {
                            "id": "bosco_c1207bd934f8dd3c726f7486d4897974",
                            "amount": {
                                "__typename": "Amount",
                                "currency": "EUR",
                                "value": "100.00"
                            },
                            "createdAt": "2025-01-08T12:47:44.170Z",
                            "beneficiary": {
                                "name": "ERIKE",
                                "iban": "ES6411112222008763481670",
                            }
                        }
                    },
                ]
            }
        }
    }

    return (
        <ResponsiveContainer style={commonStyles.fill} breakpoint={breakpoints.large}>
            {({ large }) => (
                <PlainListView
                    withoutScroll={!large}
                    stickyOffset={0}
                    data={data.account.transactions.edges.map(({ node }) => node)}
                    keyExtractor={item => item.id}
                    headerHeight={48}
                    groupHeaderHeight={48}
                    rowHeight={56}
                    extraInfo={undefined}
                    columns={columns}
                    onActiveRowChange={onActiveRowChange}
                    activeRowId={activeTransactionId ?? undefined}
                    smallColumns={[]}
                    onEndReached={() => {}}
                    getRowLink={({ item }) => (
                        <Pressable onPress={() => handleInitiateTransfer(item.amount.value, item.amount.currency, item.beneficiary.name, item.beneficiary.iban)} />
                    )}
                    loading={true}
                    renderEmptyList={() => <EmptyView
                        borderedIcon={true}
                        icon="lake-transfer"
                        title={t("transfer.list.noResults")}
                    />}
                />
                )}
        </ResponsiveContainer>

    );
};

export default PendingDemands;
