using System;
using System.Diagnostics;
using System.Threading.Tasks;
using ConduitLauncher.Domain.Entities;
using ConduitLauncher.Domain.Events;

namespace ConduitLauncher.Application.Interfaces;

public interface IMinecraftEngine
{
    event EventHandler<DownloadProgressEventArgs>? ProgressChanged;
    event EventHandler? GameClosed;
    
    Task DownloadGameAsync(string instanceRootPath, string targetVersionName);
    
    Task StartGameAsync(string instanceRootPath, string targetVersionName, string javaPath, AccountProfile account, int? maxMemoryMb = null, string? jvmFlags = null);
            
    
    void KillProcess();
}
            
            
    