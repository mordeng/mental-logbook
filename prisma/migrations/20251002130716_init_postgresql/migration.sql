-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Therapist" (
    "id" TEXT NOT NULL,
    "passcodeHash" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Therapist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistAccessLog" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "TherapistAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "moodRating" INTEGER NOT NULL,
    "feelingText" TEXT NOT NULL,
    "needText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmotionalNeed" (
    "id" TEXT NOT NULL,
    "checkInId" TEXT NOT NULL,
    "needType" TEXT NOT NULL,
    "customNeed" TEXT,

    CONSTRAINT "EmotionalNeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FFNLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactName" TEXT NOT NULL,
    "fact" TEXT NOT NULL,
    "feeling" TEXT NOT NULL,
    "need" TEXT NOT NULL,
    "response" TEXT,
    "afterFeeling" TEXT,
    "afterMood" INTEGER,
    "successRating" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FFNLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyTracker" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionAction" (
    "id" TEXT NOT NULL,
    "trackerId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "beforeMood" INTEGER,
    "afterMood" INTEGER,
    "wouldRepeat" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectionAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoundaryCheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "situation" TEXT NOT NULL,
    "wantIt" BOOLEAN NOT NULL,
    "feelsMutual" BOOLEAN NOT NULL,
    "nourishOrDrain" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reflection" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoundaryCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeaningGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "goalType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeaningGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeaningReflection" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prompt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeaningReflection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JoyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "plannedActivity" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,
    "notes" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JoyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafeContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "relationship" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafeContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrisisAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrisisAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrisisLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actionsTaken" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "CrisisLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_patientId_key" ON "Therapist"("patientId");

-- CreateIndex
CREATE INDEX "TherapistAccessLog_therapistId_accessedAt_idx" ON "TherapistAccessLog"("therapistId", "accessedAt");

-- CreateIndex
CREATE INDEX "DailyCheckIn_userId_date_idx" ON "DailyCheckIn"("userId", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheckIn_userId_date_key" ON "DailyCheckIn"("userId", "date");

-- CreateIndex
CREATE INDEX "EmotionalNeed_checkInId_idx" ON "EmotionalNeed"("checkInId");

-- CreateIndex
CREATE INDEX "FFNLog_userId_date_idx" ON "FFNLog"("userId", "date" DESC);

-- CreateIndex
CREATE INDEX "FFNLog_userId_contactName_idx" ON "FFNLog"("userId", "contactName");

-- CreateIndex
CREATE INDEX "WeeklyTracker_userId_weekStartDate_idx" ON "WeeklyTracker"("userId", "weekStartDate" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyTracker_userId_weekStartDate_key" ON "WeeklyTracker"("userId", "weekStartDate");

-- CreateIndex
CREATE INDEX "ConnectionAction_trackerId_idx" ON "ConnectionAction"("trackerId");

-- CreateIndex
CREATE INDEX "BoundaryCheckIn_userId_date_idx" ON "BoundaryCheckIn"("userId", "date" DESC);

-- CreateIndex
CREATE INDEX "MeaningGoal_userId_month_idx" ON "MeaningGoal"("userId", "month" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "MeaningGoal_userId_month_key" ON "MeaningGoal"("userId", "month");

-- CreateIndex
CREATE INDEX "MeaningReflection_goalId_date_idx" ON "MeaningReflection"("goalId", "date" DESC);

-- CreateIndex
CREATE INDEX "JoyActivity_userId_weekStartDate_idx" ON "JoyActivity"("userId", "weekStartDate" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "JoyActivity_userId_weekStartDate_key" ON "JoyActivity"("userId", "weekStartDate");

-- CreateIndex
CREATE INDEX "SafeContact_userId_order_idx" ON "SafeContact"("userId", "order");

-- CreateIndex
CREATE INDEX "CrisisAction_userId_order_idx" ON "CrisisAction"("userId", "order");

-- CreateIndex
CREATE INDEX "CrisisLog_userId_timestamp_idx" ON "CrisisLog"("userId", "timestamp" DESC);

-- AddForeignKey
ALTER TABLE "Therapist" ADD CONSTRAINT "Therapist_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistAccessLog" ADD CONSTRAINT "TherapistAccessLog_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCheckIn" ADD CONSTRAINT "DailyCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmotionalNeed" ADD CONSTRAINT "EmotionalNeed_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "DailyCheckIn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FFNLog" ADD CONSTRAINT "FFNLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyTracker" ADD CONSTRAINT "WeeklyTracker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionAction" ADD CONSTRAINT "ConnectionAction_trackerId_fkey" FOREIGN KEY ("trackerId") REFERENCES "WeeklyTracker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoundaryCheckIn" ADD CONSTRAINT "BoundaryCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeaningGoal" ADD CONSTRAINT "MeaningGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeaningReflection" ADD CONSTRAINT "MeaningReflection_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "MeaningGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoyActivity" ADD CONSTRAINT "JoyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeContact" ADD CONSTRAINT "SafeContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrisisAction" ADD CONSTRAINT "CrisisAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrisisLog" ADD CONSTRAINT "CrisisLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
