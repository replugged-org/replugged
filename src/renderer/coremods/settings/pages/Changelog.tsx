import { webpack } from "@replugged";

import { React, modal, parser } from "@common";
import { Flex, Loader, Modal, Text } from "@components";
import { intl } from "@common/i18n";
import { REPO_URL } from "src/constants";
import { t } from "src/renderer/modules/i18n";
import Icons from "../icons";
import type { RenderModalProps } from "discord-client-types/discord_app/design/web";

import ChangelogContent from "src/renderer/assets/changelog.md";

const classes = webpack.getByProps<Record<"inlineFormat" | "markup", string>>(
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
  const [content, setContent] = React.useState<string | undefined>();
  const [diff, setDiff] = React.useState<string | undefined>();

  React.useEffect(() => {
    void fetch(changelog.content)
      .then((c) => c.text())
      .then(setContent);
  }, [changelog.content]);

  React.useEffect(() => {
    if (changelog.diff) {
      setDiff(changelog.diff);
      return;
    }

    if (changelog.source)
      void RepluggedNative.installer.getGithubDiff(changelog.source).then((url) => setDiff(url));
  }, [changelog.diff, changelog.source]);

  if (!content)
    return (
      <Modal.ModalRoot size="medium" transitionState={transitionState}>
        <Loader style={{ margin: "auto" }} />
      </Modal.ModalRoot>
    );

  return (
    <Modal.ModalRoot size="medium" transitionState={transitionState}>
      <Modal.ModalHeader>
        <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.CENTER}>
          <span style={{ width: "25em", whiteSpace: "nowrap" }}>
            <Text.H1 style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {intl.string(t.REPLUGGED_CHANGELOG)}
            </Text.H1>
            <Text
              variant="text-xs/normal"
              style={{ overflow: "hidden", textOverflow: "ellipsis", color: "var(--text-muted)" }}>
              {changelog.subHeader}
            </Text>
          </span>
          <Modal.ModalCloseButton onClick={onClose} />
        </Flex>
      </Modal.ModalHeader>
      <Modal.ModalContent style={{ margin: "18px 0" }}>
        <Text className={classes?.markup} style={{ width: "100%" }}>
          {parser.parse(content, true, {
            allowHeading: true,
            allowList: true,
            allowLinks: true,
          })}
        </Text>
      </Modal.ModalContent>
      {diff && (
        <Modal.ModalFooter>
          <a key={diff} href={diff} target="_blank" rel="noreferrer" style={{ width: "100%" }}>
            <Flex
              align={Flex.Align.CENTER}
              justify={Flex.Justify.CENTER}
              style={{ gap: "5px", textAlign: "center" }}>
              <span style={{ width: "16px", height: "16px", color: "var(--text-default)" }}>
                <Icons.GitHub />
                https://github.com/
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
