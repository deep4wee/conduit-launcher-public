using System;

namespace ConduitLauncher.Domain.Events;

public class DownloadProgressEventArgs : EventArgs
{
    public int Percentage { get; }
    public string CurrentFile { get; }

    public DownloadProgressEventArgs(int percentage, string currentFile)
    {
        Percentage = percentage;
        CurrentFile = currentFile;
    }
}
    