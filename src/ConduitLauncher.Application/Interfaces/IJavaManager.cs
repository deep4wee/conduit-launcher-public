using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConduitLauncher.Domain.Entities;
using ConduitLauncher.Domain.Shared;

namespace ConduitLauncher.Application.Interfaces;
            

public interface IJavaManager
{
    event EventHandler<string>? InstallProgressChanged;

    Task<List<JavaRuntime>> DetectLocalJavaAsync();
    Task<JavaRuntime> TestJavaPathAsync(string path);
    Task<Result<JavaRuntime>> InstallAdoptiumJavaAsync(int majorVersion);
}
    