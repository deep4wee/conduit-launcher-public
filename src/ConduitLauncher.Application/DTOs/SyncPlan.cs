using System.Collections.Generic;
using ConduitLauncher.Domain.Entities;
namespace ConduitLauncher.Application.DTOs;
public class SyncPlan
{
public List<ModDefinition> ModsToDownload { get; set; } = new();
public List<ModDefinition> ModsToDelete { get; set; } = new();
}