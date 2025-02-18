import { AsyncData, Result } from "@swan-io/boxed";
import { useQuery } from "@swan-io/graphql-client";
import { Box } from "@swan-io/lake/src/components/Box";
import { Icon } from "@swan-io/lake/src/components/Icon";
import { LakeAlert } from "@swan-io/lake/src/components/LakeAlert";
import { LakeButton } from "@swan-io/lake/src/components/LakeButton";
import { LakeHeading } from "@swan-io/lake/src/components/LakeHeading";
import { LakeLabel } from "@swan-io/lake/src/components/LakeLabel";
import { LakeText } from "@swan-io/lake/src/components/LakeText";
import { LakeTooltip } from "@swan-io/lake/src/components/LakeTooltip";
import { Link } from "@swan-io/lake/src/components/Link";
import { ScrollView } from "@swan-io/lake/src/components/ScrollView";
import { Separator } from "@swan-io/lake/src/components/Separator";
import { Space } from "@swan-io/lake/src/components/Space";
import { Tile } from "@swan-io/lake/src/components/Tile";
import { TilePlaceholder } from "@swan-io/lake/src/components/TilePlaceholder";
import { colors, spacings } from "@swan-io/lake/src/constants/design";
import { isNotNullishOrEmpty, isNullishOrEmpty } from "@swan-io/lake/src/utils/nullish";
import { getCountryName, isCountryCCA3 } from "@swan-io/shared-business/src/constants/countries";
import { printIbanFormat } from "@swan-io/shared-business/src/utils/validation";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { P, match } from "ts-pattern";
import { ErrorView } from "../components/ErrorView";
import { LakeCopyTextLine } from "../components/LakeCopyTextLine";
import { AccountDetailsIbanPageDocument } from "../graphql/partner";
import { formatNestedMessage, t } from "../utils/i18n";
import { NotFoundPage } from "./NotFoundPage";

const styles = StyleSheet.create({
  content: {
    flexShrink: 1,
    flexGrow: 1,
    paddingHorizontal: spacings[24],
    paddingTop: spacings[32],
  },
  contentDesktop: {
    paddingHorizontal: spacings[40],
    paddingTop: spacings[40],
  },
  italic: {
    fontStyle: "italic",
  },
  partnerColor: {
    color: colors.partner.primary,
  },
});

const UNAVAILABLE_VALUE = <LakeText style={styles.italic}>{t("common.unavailable")}</LakeText>;
const UNKNOWN_VALUE = <LakeText style={styles.italic}>{t("common.unknown")}</LakeText>;

const joinNonEmpty = (array: (string | null | undefined)[], separator: string) =>
  array.filter(isNotNullishOrEmpty).join(separator);

const IBANCopyLine = ({ IBAN }: { IBAN: string }) => (
  <LakeCopyTextLine
    label={t("accountDetails.iban.ibanLabel")}
    text={useMemo(() => printIbanFormat(IBAN), [IBAN])}
  />
);

type Props = {
  accountId: string;
  largeBreakpoint: boolean;
};

export const AccountDetailsIbanPage = ({ accountId, largeBreakpoint }: Props) => {
  const [data] = useQuery(AccountDetailsIbanPageDocument, { accountId });

  return (
    <ScrollView contentContainerStyle={[styles.content, largeBreakpoint && styles.contentDesktop]}>
      {match(data)
        .with(AsyncData.P.NotAsked, AsyncData.P.Loading, () => (
          <>
            <TilePlaceholder />
            <Space height={32} />
            <TilePlaceholder />
          </>
        ))
        .with(AsyncData.P.Done(Result.P.Error(P.select())), error => <ErrorView error={error} />)
        .with(AsyncData.P.Done(Result.P.Ok(P.select())), ({ account }) => {
          if (!account) {
            return <NotFoundPage />;
          }

          const { BIC, IBAN, bankDetails, holder, statusInfo } = account;
          const { residencyAddress: address, verificationStatus } = holder;
          const accountClosed = statusInfo.status === "Closing" || statusInfo.status === "Closed";

          return (
            <>
              {isNotNullishOrEmpty(bankDetails) && (
                <Box alignItems="start">
                  <LakeButton
                    color="current"
                    icon="arrow-download-filled"
                    size="small"
                    href={bankDetails}
                    hrefAttrs={{ target: "blank" }}
                  >
                    {t("accountDetails.iban.bankDetails")}
                  </LakeButton>

                  <Space height={32} />
                </Box>
              )}

              <LakeHeading level={2} variant="h4">
                {t("accountDetails.title.details")}
              </LakeHeading>

              <Space height={12} />

              <Tile
                paddingVertical={24}
                footer={
                  isNullishOrEmpty(IBAN) &&
                  !accountClosed &&
                  match(verificationStatus)
                    .with("NotStarted", () => (
                      <LakeAlert
                        variant="warning"
                        anchored={true}
                        title={t("accountDetails.iban.verificationNotStartedTitle")}
                        // callToAction={
                        //   <LakeButton
                        //     mode="tertiary"
                        //     size="small"
                        //     icon="arrow-right-filled"
                        //     color="warning"
                        //     onPress={() => {
                        //       Router.push("AccountActivation", { accountMembershipId });
                        //     }}
                        //   >
                        //     Go to
                        //   </LakeButton>
                        // }
                      >
                        {t("accountDetails.iban.verificationNotStartedText")}
                      </LakeAlert>
                    ))
                    .with("Pending", () => (
                      <LakeAlert
                        variant="info"
                        anchored={true}
                        title={t("accountDetails.iban.verificationPendingTitle")}
                      >
                        {t("accountDetails.iban.verificationPendingText")}
                      </LakeAlert>
                    ))
                    .otherwise(() => null)
                }
              >
                {!accountClosed && (
                  <>
                    {isNotNullishOrEmpty(IBAN) ? (
                      <IBANCopyLine IBAN={IBAN} />
                    ) : (
                      <LakeLabel
                        label={t("accountDetails.iban.ibanLabel")}
                        render={() => UNAVAILABLE_VALUE}
                        actions={
                          <LakeTooltip
                            content={t("accountDetails.iban.ibanUnavailableTooltip")}
                            placement="right"
                            togglableOnFocus={true}
                            hideArrow={true}
                          >
                            <Icon name="error-circle-regular" size={20} tabIndex={0} />
                          </LakeTooltip>
                        }
                      />
                    )}

                    <Separator space={12} />
                  </>
                )}

                {isNotNullishOrEmpty(IBAN) ? (
                  <LakeCopyTextLine label={t("accountDetails.iban.bicLabel")} text={BIC} />
                ) : (
                  <LakeLabel
                    label={t("accountDetails.iban.bicLabel")}
                    render={() => UNAVAILABLE_VALUE}
                    actions={
                      <LakeTooltip
                        content={t("accountDetails.iban.bicUnavailableTooltip")}
                        placement="right"
                        togglableOnFocus={true}
                        hideArrow={true}
                      >
                        <Icon name="error-circle-regular" size={20} tabIndex={0} />
                      </LakeTooltip>
                    }
                  />
                )}

                <Separator space={12} />

                <LakeLabel
                  label={t("accountDetails.iban.holderLabel")}
                  render={() => <LakeText color={colors.gray[900]}>{holder.info.name}</LakeText>}
                />
              </Tile>

              <Space height={32} />

              <LakeHeading level={2} variant="h4">
                {t("accountDetails.title.address")}
              </LakeHeading>

              <Space height={12} />

              <Tile paddingVertical={24}>
                <LakeText>
                  {formatNestedMessage("accountDetails.updateEmailMention", {
                    emailAddress: (
                      <Link to="mailto:support@digio.es" style={styles.partnerColor}>
                        support@digio.es
                      </Link>
                    ),
                  })}
                </LakeText>

                <Space height={12} />

                <LakeLabel
                  label={t("accountDetails.iban.addressLabel")}
                  render={() => (
                    <LakeText color={colors.gray[900]}>
                      {joinNonEmpty([address.addressLine1, address.addressLine2], "\r\n")}
                    </LakeText>
                  )}
                />

                <Separator space={12} />

                <LakeLabel
                  label={t("accountDetails.iban.cityLabel")}
                  render={() => <LakeText color={colors.gray[900]}>{address.city ?? ""}</LakeText>}
                />

                <Separator space={12} />

                <LakeLabel
                  label={t("accountDetails.zipcodeLabel")}
                  render={() => (
                    <LakeText color={colors.gray[900]}>{address.postalCode ?? ""}</LakeText>
                  )}
                />

                <Separator space={12} />

                <LakeLabel
                  label={t("accountDetails.iban.countryLabel")}
                  render={() => (
                    <LakeText color={colors.gray[900]}>
                      {isCountryCCA3(address.country)
                        ? getCountryName(address.country)
                        : UNKNOWN_VALUE}
                    </LakeText>
                  )}
                />
              </Tile>
            </>
          );
        })
        .exhaustive()}

      <Space height={24} />
    </ScrollView>
  );
};
