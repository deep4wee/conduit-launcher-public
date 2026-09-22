namespace ConduitLauncher.Application.Interfaces;

public interface ILoggerService
{
    void LogInfo(string context, string message);
    void LogDebug(string context, string message);
    void LogWarn(string context, string message);
    void LogError(string context, string message);
}
    