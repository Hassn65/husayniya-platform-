import { PrismaClient, Prisma, Language } from "@prisma/client";

// ============================================================
// Prisma Client
// ============================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ============================================================
// Types
// ============================================================

type SupportedLanguage = Language;

type PaginationOptions = {
  page?: number;
  pageSize?: number;
};

type ProgressResult = {
  targetAmount: Prisma.Decimal;
  raisedAmount: Prisma.Decimal;
  remainingAmount: Prisma.Decimal;
  percentage: Prisma.Decimal;
  progressMode: "AUTOMATIC" | "MANUAL";
  status: string;
};

// ============================================================
// Helpers
// ============================================================

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function normalizePagination(options?: PaginationOptions) {
  const page = Math.max(
    1,
    options?.page ?? DEFAULT_PAGE,
  );

  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(
      1,
      options?.pageSize ?? DEFAULT_PAGE_SIZE,
    ),
  );

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

function decimal(value: Prisma.Decimal | number | string) {
  return new Prisma.Decimal(value);
}

// ============================================================
// Campaign
// ============================================================

export async function getFeaturedCampaign(
  language: SupportedLanguage = Language.AR,
) {
  return prisma.campaign.findFirst({
    where: {
      isFeatured: true,
    },
    include: {
      translations: {
        where: {
          language,
        },
      },
    },
  });
}

export async function getCampaignBySlug(
  slug: string,
  language: SupportedLanguage = Language.AR,
) {
  return prisma.campaign.findUnique({
    where: {
      slug,
    },
    include: {
      translations: {
        where: {
          language,
        },
      },
    },
  });
}

export async function getCampaignProgress(
  campaignId: string,
): Promise<ProgressResult | null> {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  });

  if (!campaign) {
    return null;
  }

  const target = decimal(campaign.targetAmount);
  const raised = decimal(campaign.raisedAmount);

  const remaining = Prisma.Decimal.max(
    target.minus(raised),
    decimal(0),
  );

  let percentage: Prisma.Decimal;

  if (campaign.progressMode === "MANUAL") {
    percentage = campaign.manualProgress
      ? decimal(campaign.manualProgress)
      : decimal(0);
  } else if (target.greaterThan(0)) {
    percentage = raised
      .div(target)
      .mul(100);

    if (percentage.greaterThan(100)) {
      percentage = decimal(100);
    }

    if (percentage.lessThan(0)) {
      percentage = decimal(0);
    }
  } else {
    percentage = decimal(0);
  }

  return {
    targetAmount: target,
    raisedAmount: raised,
    remainingAmount: remaining,
    percentage,
    progressMode: campaign.progressMode,
    status: campaign.status,
  };
}

export async function updateCampaign(
  campaignId: string,
  data: {
    targetAmount?: Prisma.Decimal | number | string;
    raisedAmount?: Prisma.Decimal | number | string;
    progressMode?: "AUTOMATIC" | "MANUAL";
    manualProgress?: Prisma.Decimal | number | string | null;
    status?: "PLANNING" | "ACTIVE" | "PAUSED" | "COMPLETED";
    isFeatured?: boolean;
  },
) {
  return prisma.campaign.update({
    where: {
      id: campaignId,
    },
    data: {
      ...(data.targetAmount !== undefined && {
        targetAmount: decimal(data.targetAmount),
      }),

      ...(data.raisedAmount !== undefined && {
        raisedAmount: decimal(data.raisedAmount),
      }),

      ...(data.progressMode !== undefined && {
        progressMode: data.progressMode,
      }),

      ...(data.manualProgress !== undefined && {
        manualProgress:
          data.manualProgress === null
            ? null
            : decimal(data.manualProgress),
      }),

      ...(data.status !== undefined && {
        status: data.status,
      }),

      ...(data.isFeatured !== undefined && {
        isFeatured: data.isFeatured,
      }),

      lastUpdatedAt: new Date(),
    },
  });
}

// ============================================================
// Donation Settings
// ============================================================

export async function getDonationSettings() {
  return prisma.donationSettings.findUnique({
    where: {
      key: "default",
    },
  });
}

export async function updateDonationSettings(data: {
  accountName?: string | null;
  iban?: string | null;
  bic?: string | null;
  bankName?: string | null;
  reference?: string | null;
  paypalUrl?: string | null;
}) {
  return prisma.donationSettings.upsert({
    where: {
      key: "default",
    },
    update: data,
    create: {
      key: "default",
      ...data,
    },
  });
}

// ============================================================
// Quick Donation Amounts
// ============================================================

export async function getQuickDonationAmounts() {
  return prisma.quickDonationAmount.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

export async function createQuickDonationAmount(
  amount: Prisma.Decimal | number | string,
  sortOrder = 0,
) {
  return prisma.quickDonationAmount.create({
    data: {
      amount: decimal(amount),
      sortOrder,
      isActive: true,
    },
  });
}

export async function updateQuickDonationAmount(
  id: string,
  data: {
    amount?: Prisma.Decimal | number | string;
    sortOrder?: number;
    isActive?: boolean;
  },
) {
  return prisma.quickDonationAmount.update({
    where: {
      id,
    },
    data: {
      ...(data.amount !== undefined && {
        amount: decimal(data.amount),
      }),
      ...(data.sortOrder !== undefined && {
        sortOrder: data.sortOrder,
      }),
      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),
    },
  });
}

export async function deleteQuickDonationAmount(id: string) {
  return prisma.quickDonationAmount.delete({
    where: {
      id,
    },
  });
}

// ============================================================
// Social Links
// ============================================================

export async function getSocialLinks() {
  return prisma.socialLinks.findUnique({
    where: {
      key: "default",
    },
  });
}

export async function updateSocialLinks(data: {
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
}) {
  return prisma.socialLinks.upsert({
    where: {
      key: "default",
    },
    update: data,
    create: {
      key: "default",
      ...data,
    },
  });
}

// ============================================================
// Contact Settings
// ============================================================

export async function getContactSettings() {
  return prisma.contactSettings.findUnique({
    where: {
      key: "default",
    },
  });
}

export async function updateContactSettings(data: {
  officialName?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
}) {
  return prisma.contactSettings.upsert({
    where: {
      key: "default",
    },
    update: data,
    create: {
      key: "default",
      ...data,
    },
  });
}

// ============================================================
// Site Settings
// ============================================================

export async function getSiteSettings() {
  return prisma.siteSettings.findUnique({
    where: {
      key: "default",
    },
  });
}

export async function updateSiteSettings(data: {
  siteName?: string;
  defaultLanguage?: SupportedLanguage;
  supportedLanguages?: SupportedLanguage[];
}) {
  return prisma.siteSettings.upsert({
    where: {
      key: "default",
    },
    update: data,
    create: {
      key: "default",
      siteName: data.siteName ?? "Husayniya",
      defaultLanguage:
        data.defaultLanguage ?? Language.AR,
      supportedLanguages:
        data.supportedLanguages ?? [
          Language.AR,
          Language.DE,
          Language.EN,
          Language.FA,
        ],
    },
  });
}

// ============================================================
// Services
// ============================================================

export async function getPublishedServices(
  language: SupportedLanguage = Language.AR,
) {
  return prisma.service.findMany({
    where: {
      isActive: true,
    },
    include: {
      translations: {
        where: {
          language,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

export async function getAllServices(
  options?: PaginationOptions,
) {
  const { skip, take } = normalizePagination(options);

  return prisma.service.findMany({
    skip,
    take,
    include: {
      translations: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

// ============================================================
// Activities
// ============================================================

export async function getPublishedActivities(
  language: SupportedLanguage = Language.AR,
) {
  return prisma.activity.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      translations: {
        where: {
          language,
        },
      },
    },
    orderBy: {
      startAt: "asc",
    },
  });
}

export async function getAllActivities(
  options?: PaginationOptions,
) {
  const { skip, take } = normalizePagination(options);

  return prisma.activity.findMany({
    skip,
    take,
    include: {
      translations: true,
    },
    orderBy: {
      startAt: "desc",
    },
  });
}

// ============================================================
// News
// ============================================================

export async function getPublishedNews(
  language: SupportedLanguage = Language.AR,
  options?: PaginationOptions,
) {
  const { skip, take } = normalizePagination(options);

  return prisma.news.findMany({
    where: {
      status: "PUBLISHED",
    },
    skip,
    take,
    include: {
      translations: {
        where: {
          language,
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
  });
}

export async function getNewsBySlug(
  slug: string,
  language: SupportedLanguage = Language.AR,
) {
  return prisma.news.findUnique({
    where: {
      slug,
    },
    include: {
      translations: {
        where: {
          language,
        },
      },
    },
  });
}

export async function getAllNews(
  options?: PaginationOptions,
) {
  const { skip, take } = normalizePagination(options);

  return prisma.news.findMany({
    skip,
    take,
    include: {
      translations: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// ============================================================
// FAQ
// ============================================================

export async function getPublishedFAQs(
  language: SupportedLanguage = Language.AR,
) {
  return prisma.fAQ.findMany({
    where: {
      isActive: true,
    },
    include: {
      translations: {
        where: {
          language,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

export async function getAllFAQs(
  options?: PaginationOptions,
) {
  const { skip, take } = normalizePagination(options);

  return prisma.fAQ.findMany({
    skip,
    take,
    include: {
      translations: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

// ============================================================
// Quotes
// ============================================================

export async function getPublishedQuotes(
  language: SupportedLanguage = Language.AR,
) {
  return prisma.quote.findMany({
    where: {
      isActive: true,
    },
    include: {
      translations: {
        where: {
          language,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

export async function getAllQuotes(
  options?: PaginationOptions,
) {
  const { skip, take } = normalizePagination(options);

  return prisma.quote.findMany({
    skip,
    take,
    include: {
      translations: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

// ============================================================
// Media
// ============================================================

export async function getMedia(
  options?: PaginationOptions,
) {
  const { skip, take } = normalizePagination(options);

  return prisma.media.findMany({
    skip,
    take,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getMediaById(id: string) {
  return prisma.media.findUnique({
    where: {
      id,
    },
  });
}

export async function deleteMedia(id: string) {
  return prisma.media.delete({
    where: {
      id,
    },
  });
}

// ============================================================
// Contact Messages
// ============================================================

export async function createContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return prisma.contactMessage.create({
    data: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      status: "UNREAD",
    },
  });
}

export async function getContactMessages(
  options?: PaginationOptions,
) {
  const { skip, take } = normalizePagination(options);

  return prisma.contactMessage.findMany({
    skip,
    take,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getContactMessageById(id: string) {
  return prisma.contactMessage.findUnique({
    where: {
      id,
    },
  });
}

export async function updateContactMessageStatus(
  id: string,
  status: "UNREAD" | "READ" | "ARCHIVED",
) {
  return prisma.contactMessage.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function deleteContactMessage(id: string) {
  return prisma.contactMessage.delete({
    where: {
      id,
    },
  });
}

// ============================================================
// Audit Logs
// ============================================================

export async function createAuditLog(data: {
  userId?: string | null;
  action:
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "LOGIN"
    | "LOGOUT"
    | "UPLOAD"
    | "DELETE_MEDIA";
  entity?: string | null;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.auditLog.create({
    data: {
      userId: data.userId ?? null,
      action: data.action,
      entity: data.entity ?? null,
      entityId: data.entityId ?? null,
      metadata: data.metadata,
    },
  });
}

export async function getAuditLogs(
  options?: PaginationOptions,
) {
  const { skip, take } = normalizePagination(options);

  return prisma.auditLog.findMany({
    skip,
    take,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });
}

// ============================================================
// Dashboard Summary
// ============================================================

export async function getDashboardSummary() {
  const [
    campaign,
    unreadMessages,
    newsCount,
    activitiesCount,
    mediaCount,
  ] = await Promise.all([
    prisma.campaign.findFirst({
      where: {
        isFeatured: true,
      },
    }),

    prisma.contactMessage.count({
      where: {
        status: "UNREAD",
      },
    }),

    prisma.news.count(),

    prisma.activity.count(),

    prisma.media.count(),
  ]);

  let campaignProgress: ProgressResult | null = null;

  if (campaign) {
    campaignProgress = await getCampaignProgress(
      campaign.id,
    );
  }

  return {
    campaign: campaignProgress,
    unreadMessages,
    newsCount,
    activitiesCount,
    mediaCount,
  };
}
