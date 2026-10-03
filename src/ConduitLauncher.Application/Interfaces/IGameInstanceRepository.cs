using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ConduitLauncher.Domain.Entities;
using ConduitLauncher.Domain.Shared;

namespace ConduitLauncher.Application.Interfaces;

public interface IGameInstanceRepository
{
    Task<Result<GameInstance>> GetByIdAsync(InstanceId id, CancellationToken cancellationToken = default);
    Task<List<GameInstance>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Result> SaveAsync(GameInstance instance, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(InstanceId id, CancellationToken cancellationToken = default);
}
