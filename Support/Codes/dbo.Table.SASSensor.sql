CREATE TABLE [dbo].[SASSensor] (
	[PartitionId] NCHAR(64) NOT NULL,
    [msgId]      NCHAR (25) NOT NULL,
    [deviceId]   TEXT       NOT NULL,
    [temp]       REAL       NOT NULL,
    [brightness] REAL       NULL,
    [accelx]     REAL       NOT NULL,
    [accely]     REAL       NOT NULL,
    [accelz]     REAL       NOT NULL,
    [time]       DATETIME   NOT NULL,
    [Longitude]  REAL       NULL,
    [Latitude]   REAL       NULL,
	[IoTHub]	TEXT	NULL,
	[EventEnqueuedUtcTime] DATETIME	NOT NULL,
	[EventProcessedUtcTime] DATETIME	NOT NULL
    PRIMARY KEY CLUSTERED ([msgId] ASC)
);