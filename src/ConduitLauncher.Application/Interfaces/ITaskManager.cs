using System;
using System.Collections.Generic;

namespace ConduitLauncher.Application.Interfaces;

using System.Threading;

public record BackgroundTask(string Id, string Type, string Title, string Status, int Progress, bool IsCancellable, string? InstanceId = null);

public interface ITaskManager
{
    event EventHandler<System.Collections.Generic.IEnumerable<BackgroundTask>> TasksUpdated;
    
    string StartTask(string type, string title, bool isCancellable, string? instanceId = null);
    void UpdateTask(string id, string status, int progress, string? instanceId = null);
    void CompleteTask(string id);
    void FailTask(string id, string errorMessage);
    void CancelTask(string id);
    CancellationToken GetToken(string id);
    System.Collections.Generic.IEnumerable<BackgroundTask> GetAllTasks();
}
            
    