namespace ConduitLauncher.Domain.Entities;

public sealed record StorageMetrics(
    string DriveName, 
    long TotalSpace, 
    long FreeSpace, 
    long LauncherSpace, 
    long OtherSpace, 
    string RootPath
);
    