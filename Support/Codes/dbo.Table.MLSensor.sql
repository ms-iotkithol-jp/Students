CREATE TABLE [dbo].[MLSensor] (
    [msgId]      NCHAR (25) NOT NULL,
    [deviceId]   TEXT       NOT NULL,
    [time]       DATETIME   NOT NULL,
    [accelx]     REAL       NOT NULL,
    [accely]     REAL       NOT NULL,
    [accelz]     REAL       NOT NULL,
    [TempStatus] NCHAR (10) NOT NULL,
    PRIMARY KEY CLUSTERED ([msgId] ASC)
);