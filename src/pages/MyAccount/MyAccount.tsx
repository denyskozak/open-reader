import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button, Card, Chip, SegmentedControl, Text, Title } from "@telegram-apps/telegram-ui";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/app/providers/ThemeProvider";
import { useTMA } from "@/app/providers/TMAProvider";
import { useToast } from "@/shared/ui/ToastProvider";
import {
  fetchProposalsForVoting,
  submitBookProposal,
  submitProposalVote,
} from "@/entities/proposal/api";
import type { ProposalForVoting } from "@/entities/proposal/types";

const BOOK_SECTION = "myBooks" as const;
const PUBLISH_SECTION = "publish" as const;
const VOTE_SECTION = "voting" as const;

const mockBooks = [
  {
    id: "ton-collectible-01",
    title: "The Blockchain Explorer",
    author: "Eva Anton",
    cover: "/images/books/b1.jpg",
    collection: "Talegram Originals",
    tokenId: "#1245",
    status: "owned" as const,
  },
  {
    id: "ton-collectible-02",
    title: "Waves of the Ton",
    author: "Ilya Mirov",
    cover: "/images/books/b3.jpg",
    collection: "Indie Shelf",
    tokenId: "#0981",
    status: "listed" as const,
  },
  {
    id: "ton-collectible-03",
    title: "Encrypted Tales",
    author: "Sara Kim",
    cover: "/images/books/b7.jpg",
    collection: "Limited Drops",
    tokenId: "#2210",
    status: "owned" as const,
  },
];

type AccountSection = typeof BOOK_SECTION | typeof PUBLISH_SECTION | typeof VOTE_SECTION;

type VoteDirection = "positive" | "negative";

type PublishFormState = {
  title: string;
  author: string;
  description: string;
  fileName: string;
  file: File | null;
};

const createInitialFormState = (): PublishFormState => ({
  title: "",
  author: "",
  description: "",
  fileName: "",
  file: null,
});

export default function MyAccount(): JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const { launchParams } = useTMA();
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<AccountSection>(BOOK_SECTION);
  const [formState, setFormState] = useState<PublishFormState>(() => createInitialFormState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allowedVoterIds = useMemo(() => {
    const raw = import.meta.env.VITE_ALLOWED_TELEGRAM_IDS;
    if (!raw) {
      return new Set<string>();
    }
    return new Set(
      raw
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0),
    );
  }, []);
  const fallbackTelegramId = import.meta.env.VITE_MOCK_TELEGRAM_ID;
  const telegramUserId = useMemo(() => {
    const rawUserId = (
      launchParams?.initData as { user?: { id?: number | string } } | undefined
    )?.user?.id;
    if (typeof rawUserId === "number") {
      return rawUserId.toString();
    }
    if (typeof rawUserId === "string" && rawUserId.length > 0) {
      return rawUserId;
    }
    if (typeof fallbackTelegramId === "string" && fallbackTelegramId.length > 0) {
      return fallbackTelegramId;
    }
    return undefined;
  }, [fallbackTelegramId, launchParams]);
  const isAllowedVoter = telegramUserId ? allowedVoterIds.has(telegramUserId) : false;
  const [votingProposals, setVotingProposals] = useState<ProposalForVoting[]>([]);
  const [allowedVotersCount, setAllowedVotersCount] = useState<number>(() => allowedVoterIds.size);
  const [isVotingLoading, setIsVotingLoading] = useState(false);
  const [votingError, setVotingError] = useState<string | null>(null);
  const [pendingVote, setPendingVote] = useState<{
    proposalId: string;
    direction: VoteDirection;
  } | null>(null);

  const menuItems = useMemo(
    () => [
      { key: BOOK_SECTION, label: t("account.menu.myBooks") },
      { key: PUBLISH_SECTION, label: t("account.menu.publish") },
      { key: VOTE_SECTION, label: t("account.menu.voting") },
    ],
    [t],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFormState((prev) => ({
      ...prev,
      fileName: file ? file.name : "",
      file: file ?? null,
    }));
  };

  const loadVotingProposals = useCallback(async () => {
    if (!telegramUserId || !isAllowedVoter) {
      setVotingProposals([]);
      setVotingError(null);
      setIsVotingLoading(false);
      setAllowedVotersCount(allowedVoterIds.size);
      return;
    }

    setIsVotingLoading(true);
    setVotingError(null);
    try {
      const response = await fetchProposalsForVoting(telegramUserId);
      setVotingProposals(response.proposals);
      setAllowedVotersCount(
        typeof response.allowedVotersCount === "number"
          ? response.allowedVotersCount
          : allowedVoterIds.size,
      );
    } catch (error) {
      console.error("Failed to load proposals for voting", error);
      setVotingError(t("account.voting.loadError"));
    } finally {
      setIsVotingLoading(false);
    }
  }, [allowedVoterIds, isAllowedVoter, t, telegramUserId]);

  const handleVote = useCallback(
    async (proposalId: string, direction: VoteDirection) => {
      if (!telegramUserId || !isAllowedVoter) {
        return;
      }

      setPendingVote({ proposalId, direction });
      try {
        const result = await submitProposalVote({
          proposalId,
          telegramUserId,
          isPositive: direction === "positive",
        });

        setAllowedVotersCount(
          typeof result.allowedVotersCount === "number"
            ? result.allowedVotersCount
            : allowedVoterIds.size,
        );

        if (result.status === "PENDING") {
          setVotingProposals((prev) =>
            prev.map((proposal) =>
              proposal.id === proposalId
                ? {
                    ...proposal,
                    votes: {
                      positiveVotes: result.positiveVotes,
                      negativeVotes: result.negativeVotes,
                      userVote: result.userVote,
                    },
                  }
                : proposal,
            ),
          );
          showToast(t("account.voting.toast.submitted"));
        } else {
          setVotingProposals((prev) => prev.filter((proposal) => proposal.id !== proposalId));
          showToast(
            result.status === "APPROVED"
              ? t("account.voting.toast.approved")
              : t("account.voting.toast.rejected"),
          );
        }
      } catch (error) {
        console.error("Failed to submit vote", error);
        showToast(t("account.voting.toast.error"));
      } finally {
        setPendingVote(null);
      }
    },
    [allowedVoterIds, isAllowedVoter, showToast, t, telegramUserId],
  );

  useEffect(() => {
    if (activeSection === VOTE_SECTION) {
      void loadVotingProposals();
    }
  }, [activeSection, loadVotingProposals]);

  const handleRetryVoting = useCallback(() => {
    void loadVotingProposals();
  }, [loadVotingProposals]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (!formState.file) {
      showToast(t("account.publish.toastMissingFile"));
      return;
    }

    setIsSubmitting(true);
    try {
      await submitBookProposal({
        title: formState.title,
        author: formState.author,
        description: formState.description,
        file: formState.file,
      });

      const title = formState.title || t("account.publish.toastFallbackTitle");
      showToast(t("account.publish.toastSuccess", { title }));
      setFormState(createInitialFormState());
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to submit book proposal", error);
      showToast(t("account.publish.toastError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedAllowedVoters =
    allowedVotersCount > 0 ? allowedVotersCount : allowedVoterIds.size;

  return (
    <div
      style={{
        margin: "0 auto",
        maxWidth: 720,
        padding: "24px 16px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Title level="1" weight="2">
          {t("account.title")}
        </Title>
        <Text style={{ color: theme.subtitle }}>{t("account.subtitle")}</Text>
      </header>

      <SegmentedControl>
        {menuItems.map((item) => (
          <SegmentedControl.Item
            key={item.key}
            selected={item.key === activeSection}
            onClick={() => setActiveSection(item.key as AccountSection)}
          >
            {item.label}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl>

      {activeSection === BOOK_SECTION && (
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Title level="2" weight="2">
              {t("account.myBooks.title")}
            </Title>
            <Text style={{ color: theme.subtitle }}>{t("account.myBooks.description")}</Text>
          </div>
          {mockBooks.map((book) => (
            <Card key={book.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", gap: 16 }}>
                <img
                  src={book.cover}
                  alt={t("account.myBooks.coverAlt", { title: book.title })}
                  style={{
                    width: 96,
                    height: 128,
                    borderRadius: 12,
                    objectFit: "cover",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.12)",
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <div>
                    <Title level="3" weight="2">
                      {book.title}
                    </Title>
                    <Text style={{ color: theme.subtitle }}>{book.author}</Text>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Chip mode="elevated">{t("account.myBooks.tonBadge")}</Chip>
                    <Chip mode="outline">{book.collection}</Chip>
                    <Chip mode="outline">{t(`account.myBooks.status.${book.status}`)}</Chip>
                  </div>
                  <Text style={{ color: theme.hint }}>
                    {t("account.myBooks.token", { token: book.tokenId })}
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}

      {activeSection === PUBLISH_SECTION && (
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Title level="2" weight="2">
              {t("account.publish.title")}
            </Title>
            <Text style={{ color: theme.subtitle }}>{t("account.publish.description")}</Text>
          </div>
          <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Text weight="2">{t("account.publish.form.name.label")}</Text>
                <input
                  required
                  name="title"
                  value={formState.title}
                  onChange={handleInputChange}
                  placeholder={t("account.publish.form.name.placeholder")}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${theme.separator}`,
                    background: theme.section,
                    color: theme.text,
                  }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Text weight="2">{t("account.publish.form.author.label")}</Text>
                <input
                  required
                  name="author"
                  value={formState.author}
                  onChange={handleInputChange}
                  placeholder={t("account.publish.form.author.placeholder")}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${theme.separator}`,
                    background: theme.section,
                    color: theme.text,
                  }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Text weight="2">{t("account.publish.form.description.label")}</Text>
                <textarea
                  required
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  placeholder={t("account.publish.form.description.placeholder")}
                  rows={5}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${theme.separator}`,
                    background: theme.section,
                    color: theme.text,
                    resize: "vertical",
                    minHeight: 120,
                    font: "inherit",
                  }}
                />
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Text weight="2">{t("account.publish.form.file.label")}</Text>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".epub"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <Button type="button" mode="outline" size="s" onClick={() => fileInputRef.current?.click()}>
                    {t("account.publish.form.file.cta")}
                  </Button>
                  <Text style={{ color: theme.subtitle }}>
                    {formState.fileName || t("account.publish.form.file.placeholder")}
                  </Text>
                </div>
              </div>
              <Button
                type="submit"
                mode="filled"
                size="m"
                loading={isSubmitting}
                disabled={!formState.file}
              >
                {t("account.publish.form.submit")}
              </Button>
            </form>
            <Text style={{ color: theme.hint }}>{t("account.publish.form.notice")}</Text>
          </Card>
        </section>
      )}

      {activeSection === VOTE_SECTION && (
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Title level="2" weight="2">
              {t("account.voting.title")}
            </Title>
            <Text style={{ color: theme.subtitle }}>{t("account.voting.description")}</Text>
            <Text style={{ color: theme.hint }}>
              {t("account.voting.threshold", { count: displayedAllowedVoters })}
            </Text>
          </div>
          {!telegramUserId ? (
            <Card style={{ padding: 16 }}>
              <Text style={{ color: theme.subtitle }}>{t("account.voting.notTelegram")}</Text>
            </Card>
          ) : !isAllowedVoter ? (
            <Card style={{ padding: 16 }}>
              <Text style={{ color: theme.subtitle }}>{t("account.voting.notAllowed")}</Text>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {votingError ? (
                <Card style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <Text style={{ color: theme.subtitle }}>{votingError}</Text>
                  <Button type="button" mode="outline" size="s" onClick={handleRetryVoting}>
                    {t("buttons.retry")}
                  </Button>
                </Card>
              ) : isVotingLoading ? (
                <Card style={{ padding: 16 }}>
                  <Text style={{ color: theme.subtitle }}>{t("account.voting.loading")}</Text>
                </Card>
              ) : votingProposals.length === 0 ? (
                <Card style={{ padding: 16 }}>
                  <Text style={{ color: theme.subtitle }}>{t("account.voting.empty")}</Text>
                </Card>
              ) : (
                votingProposals.map((proposal) => (
                  <Card key={proposal.id} style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <Title level="3" weight="2">
                        {proposal.title}
                      </Title>
                      <Text style={{ color: theme.subtitle }}>{proposal.author}</Text>
                    </div>
                    <Text style={{ color: theme.text }}>{proposal.description}</Text>
                    <Text style={{ color: theme.subtitle }}>
                      {t("account.voting.progress", {
                        positive: proposal.votes.positiveVotes,
                        total: displayedAllowedVoters,
                        negative: proposal.votes.negativeVotes,
                      })}
                    </Text>
                    {proposal.votes.userVote && (
                      <Text style={{ color: theme.hint }}>
                        {proposal.votes.userVote === "positive"
                          ? t("account.voting.youVoted.approve")
                          : t("account.voting.youVoted.reject")}
                      </Text>
                    )}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button
                        size="s"
                        mode={proposal.votes.userVote === "positive" ? "filled" : "outline"}
                        onClick={() => handleVote(proposal.id, "positive")}
                        loading={
                          pendingVote?.proposalId === proposal.id && pendingVote.direction === "positive"
                        }
                        disabled={pendingVote?.proposalId === proposal.id}
                      >
                        {t("account.voting.actions.approve")}
                      </Button>
                      <Button
                        size="s"
                        mode={proposal.votes.userVote === "negative" ? "filled" : "outline"}
                        onClick={() => handleVote(proposal.id, "negative")}
                        loading={
                          pendingVote?.proposalId === proposal.id && pendingVote.direction === "negative"
                        }
                        disabled={pendingVote?.proposalId === proposal.id}
                      >
                        {t("account.voting.actions.reject")}
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
