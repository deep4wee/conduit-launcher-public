namespace ConduitLauncher.Domain.Entities;

public sealed record JavaRuntime(
    string Path,
    string Version,
    int MajorVersion,
    bool IsValid,
    string ErrorMessage = ""
);
    