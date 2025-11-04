import { webpack } from "@replugged";
import { React, classNames, modal, parser } from "@common";
import { Flex, Loader, Modal, Text } from "@components";
import { intl } from "@common/i18n";
import { REPO_URL } from "src/constants";
import { t } from "src/renderer/modules/i18n";
import Icons from "../icons";
import ChangelogContent from "src/renderer/assets/changelog.md";

import "./Changelog.css";

import type { RenderModalProps } from "discord-client-types/discord_app/design/web";

const classes = await webpack.waitForProps<Record<"inlineFormat" | "markup", string>>(
  "inlineFormat",
  "markup",
);

interface ChangelogModalProps extends RenderModalProps {
  changelog: { content: string; subHeader: string; source?: string; diff?: string };
}

export const ChangelogModal = ({
  changelog,
  onClose,
  transitionState,
}: ChangelogModalProps): React.ReactElement => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [content, setContent] = React.useState<string | undefined>();
  const [diff, setDiff] = React.useState<string | undefined>();

  async function loadChangelog(): Promise<void> {
    if (!loading) setLoading(true);
    if (changelog.diff) setDiff(changelog.diff);

    const contentRes = await fetch(changelog.content);
    const contentText = await contentRes.text();
    setContent(contentText);

    if (!changelog.diff && changelog.source) {
      const diffUrl = await RepluggedNative.installer.getGithubDiff(changelog.source);
      setDiff(diffUrl);
    }
    if (loading) setLoading(false);
  }

  React.useEffect(() => {
    void loadChangelog();
  }, [changelog.diff, changelog.source, changelog.content]);

  if (loading)
    return (
      <Modal.ModalRoot size="medium" transitionState={transitionState}>
        <Loader style={{ margin: "auto" }} />
      </Modal.ModalRoot>
    );

  return (
    <Modal.ModalRoot size="medium" transitionState={transitionState}>
      <Modal.ModalHeader>
        <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.CENTER}>
          <span className="replugged-changelog-container">
            <Text
              variant="heading-xl/bold"
              color="header-primary"
              tag="h1"
              className="replugged-changelog-header">
              {intl.string(t.REPLUGGED_CHANGELOG)}
            </Text>
            <Text variant="text-xs/normal" className="replugged-changelog-subHeader">
              {changelog.subHeader}
            </Text>
          </span>
          <Modal.ModalCloseButton onClick={onClose} />
        </Flex>
      </Modal.ModalHeader>
      <Modal.ModalContent className="replugged-changelog-contentContainer">
        <Text className={classNames(classes.markup, "replugged-changelog-content")}>
          {parser.parse(content, true, {
            allowHeading: true,
            allowList: true,
            allowLinks: true,
            previewLinkTarget: true,
          })}
        </Text>
      </Modal.ModalContent>
      {diff && (
        <Modal.ModalFooter>
          <a
            key={diff}
            href={diff}
            target="_blank"
            rel="noreferrer"
            className="replugged-changelog-diff">
            <Flex
              align={Flex.Align.CENTER}
              justify={Flex.Justify.CENTER}
              className="replugged-changelog-diffContainer">
              <span className="replugged-changelog-diffIcon">
                <Icons.GitHub />
              </span>
              <Text>
                {intl.format(t.REPLUGGED_CHANGELOG_SOURCE_DIFF, {
                  diff: diff.split("compare/")[1],
                })}
              </Text>
            </Flex>
          </a>
        </Modal.ModalFooter>
      )}
    </Modal.ModalRoot>
  );
};

export const openChangelog = (
  e: React.MouseEvent,
  props?: { content: string; subHeader: string; source?: string; diff?: string },
): void => {
  props ??= {
    content: ChangelogContent,
    subHeader: RepluggedNative.getVersion(),
    source: REPO_URL,
  };

  e.preventDefault();
  e.stopPropagation();
  modal.openModal((e) => <ChangelogModal {...e} changelog={props} />);
};
