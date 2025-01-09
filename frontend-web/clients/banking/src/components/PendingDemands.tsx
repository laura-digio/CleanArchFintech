import { useMutation } from "@swan-io/graphql-client";
import { Cell, HeaderCell } from "@swan-io/lake/src/components/Cells";
import { EmptyView } from "@swan-io/lake/src/components/EmptyView";
import { FocusTrapRef } from "@swan-io/lake/src/components/FocusTrap";
import { LakeButton, LakeButtonGroup } from "@swan-io/lake/src/components/LakeButton";
import { LakeHeading } from "@swan-io/lake/src/components/LakeHeading";
import { ListRightPanel, ListRightPanelContent } from "@swan-io/lake/src/components/ListRightPanel";
import { ColumnConfig, PlainListView } from "@swan-io/lake/src/components/PlainListView";
import { ReadOnlyFieldList } from "@swan-io/lake/src/components/ReadOnlyFieldList";
import { ResponsiveContainer } from "@swan-io/lake/src/components/ResponsiveContainer";
import { Space } from "@swan-io/lake/src/components/Space";
import { Tag } from "@swan-io/lake/src/components/Tag";
import { Tile } from "@swan-io/lake/src/components/Tile";
import { commonStyles } from "@swan-io/lake/src/constants/commonStyles";
import { backgroundColor, breakpoints, colors } from "@swan-io/lake/src/constants/design";
import { filterRejectionsToResult } from "@swan-io/lake/src/utils/gql";
import { showToast } from "@swan-io/shared-business/src/state/toasts";
import { translateError } from "@swan-io/shared-business/src/utils/i18n";
import { printFormat } from "iban";
import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { match } from "ts-pattern";
import {
  InitiateSepaCreditTransfersDocument,
  TransactionDetailsFragment,
} from "../graphql/partner";
import { t } from "../utils/i18n";
import { Router } from "../utils/routes";
import { DetailLine } from "./DetailLine";

const styles = StyleSheet.create({
  fill: {
    ...commonStyles.fill,
  },
  tile: {
    alignItems: "center",
  },
  wrapText: {
    display: "flex",
    wordBreak: "break-all",
    flexDirection: "row",
    alignItems: "center",
  },
  buttonGroup: {
    backgroundColor: backgroundColor.default,
    position: "sticky",
    bottom: 0,
  },
});

const columns: ColumnConfig<TransactionDetailsFragment, undefined>[] = [
  {
    id: "label",
    width: "grow",
    title: t("transactions.transaction"),
    renderTitle: ({ title }) => <HeaderCell text={title} />,
    renderCell: ({ item }) => (
      <Cell>
        <LakeHeading variant="h5" level={3} numberOfLines={1}>
          {item.beneficiary.name}
        </LakeHeading>

        <>
          <Space width={16} />
          <Tag color="shakespear">{item.amount.value + " " + item.amount.currency}</Tag>
        </>
      </Cell>
    ),
  },
];

export const PendingDemands = ({ accountId, accountMembershipId }) => {
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
        creditTransfers: [
          {
            amount: {
              value,
              currency,
            },
            mode: "InstantWithFallback",
            sepaBeneficiary: {
              name,
              save: false,
              iban,
              isMyOwnIban: false,
            },
          },
        ],
      },
    })
      .mapOk(data => data.initiateCreditTransfers)
      .mapOkToResult(filterRejectionsToResult)
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
  };

  const data = {
    __typename: "Query",
    account: {
      __typename: "Account",
      id: "bd348fa7-0388-4725-b316-cb3fef9bd664",
      number: "28602927376",
      name: "JoSeBu's Money",
      transactions: {
        __typename: "TransactionConnection",
        pageInfo: {
          __typename: "PageInfo",
          endCursor: "MTczNjMyNzgxODA1Mzo6OmJvc2NpXzIyYjVjNDU5ZmNmMThhYzEyNGE4MDA1MWMxOGJmMGNm",
          hasNextPage: false,
        },
        edges: [
          {
            __typename: "TransactionEdge",
            node: {
              id: "bosco_c1207bd934f8dd3c726f7486d4897974",
              amount: {
                __typename: "Amount",
                currency: "EUR",
                value: "50.00",
              },
              createdAt: "2025-01-08T12:47:44.170Z",
              beneficiary: {
                name: "ERIKA",
                iban: "ES6411112222008763481670",
              },
            },
          },
          {
            __typename: "TransactionEdge",
            node: {
              id: "bosco_c1207bd934f8dd3c726f7486d4897975",
              amount: {
                __typename: "Amount",
                currency: "EUR",
                value: "1000.00",
              },
              createdAt: "2025-01-08T12:47:44.170Z",
              beneficiary: {
                name: "ERIKINHO",
                iban: "ES6411112222008763481670",
              },
            },
          },
          {
            __typename: "TransactionEdge",
            node: {
              id: "bosco_c1207bd934f8dd3c726f7486d4897976",
              amount: {
                __typename: "Amount",
                currency: "EUR",
                value: "100.00",
              },
              createdAt: "2025-01-08T12:47:44.170Z",
              beneficiary: {
                name: "ERIKE",
                iban: "ES6411112222008763481670",
              },
            },
          },
        ],
      },
    },
  };

  return (
    <ResponsiveContainer style={commonStyles.fill} breakpoint={breakpoints.large}>
      {({ large }) => (
        <>
          <PlainListView
            data={data.account.transactions.edges.map(({ node }) => node)}
            keyExtractor={item => item.id}
            headerHeight={48}
            groupHeaderHeight={0}
            rowHeight={56}
            extraInfo={undefined}
            columns={columns}
            onActiveRowChange={onActiveRowChange}
            activeRowId={activeTransactionId ?? undefined}
            smallColumns={[]}
            onEndReached={() => {}}
            getRowLink={({ item }) => (
              <Pressable
                onPress={() => {
                  console.log(item);
                  setActiveTransactionId(item.id);
                }}
              />
            )}
            loading={{
              isLoading: false,
              count: 2,
            }}
            renderEmptyList={() => (
              <EmptyView
                borderedIcon={true}
                icon="lake-transfer"
                title={t("transfer.list.noResults")}
              />
            )}
          />
          <ListRightPanel
            ref={panelRef}
            keyExtractor={item => item.id}
            activeId={activeTransactionId}
            onActiveIdChange={setActiveTransactionId}
            onClose={() => setActiveTransactionId(null)}
            items={data.account.transactions.edges.map(item => item.node) ?? []}
            render={(transaction, large) => (
              <ListRightPanelContent large={large} style={styles.fill}>
                <Tile style={styles.tile}>
                  <LakeHeading
                    variant="h4"
                    level={3}
                    align="center"
                    color={colors.gray[700]}
                    style={styles.wrapText}
                  >
                    {transaction.beneficiary.name}
                  </LakeHeading>
                </Tile>
                <Space height={24} />
                <ReadOnlyFieldList>
                  <DetailLine
                    label={t("beneficiaries.details.name")}
                    text={transaction.beneficiary.name}
                  />
                  <DetailLine
                    label={t("beneficiaries.details.iban")}
                    text={printFormat(transaction.beneficiary.iban)}
                  />
                </ReadOnlyFieldList>
                <View style={styles.buttonGroup}>
                  <LakeButtonGroup paddingBottom={0}>
                    <LakeButton
                      size="small"
                      color="current"
                      icon="arrow-download-filled"
                      loading={false}
                      onPress={() =>
                        handleInitiateTransfer(
                          transaction.amount.value,
                          transaction.amount.currency,
                          transaction.beneficiary.name,
                          transaction.beneficiary.iban,
                        )
                      }
                    >
                      {t("recurringTransfer.new.transferType.regular")}
                    </LakeButton>
                  </LakeButtonGroup>
                </View>
              </ListRightPanelContent>
            )}
            closeLabel={t("common.closeButton")}
            previousLabel={t("common.previous")}
            nextLabel={t("common.next")}
          />
        </>
      )}
    </ResponsiveContainer>
  );
};

export default PendingDemands;
