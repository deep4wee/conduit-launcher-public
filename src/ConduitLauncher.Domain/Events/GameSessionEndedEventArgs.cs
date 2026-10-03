using System;

namespace ConduitLauncher.Domain.Events;

public class GameSessionEndedEventArgs : EventArgs
{
    public string InstanceId { get; }
    public TimeSpan Duration { get; }
    public int ExitCode { get; }

    public GameSessionEndedEventArgs(string instanceId, TimeSpan duration, int exitCode)
    {
        InstanceId = instanceId;
        Duration = duration;
        ExitCode = exitCode;
    }
}
