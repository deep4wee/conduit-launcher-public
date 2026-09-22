namespace ConduitLauncher.Domain.Entities;

public class LauncherPrefs
{
    public string Theme { get; set; } = "dark";
    public string Language { get; set; } = "uk";
    public float UiScale { get; set; } = 1.0f;
    public string FontFamily { get; set; } = "inter";
    public bool UseSystemBrowser { get; set; } = true;
    public bool DebugMarkdown { get; set; } = false;
        public bool EnableNetworkTrace { get; set; } = false;
    public int MaxConcurrentDownloads { get; set; } = 10;
    public string ActiveAccountId { get; set; } = string.Empty;
}
            




