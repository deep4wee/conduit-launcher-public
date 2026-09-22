using System.Threading.Tasks;
using ConduitLauncher.Domain.Entities;
namespace ConduitLauncher.Application.Interfaces;
public interface ILocalStateStore
{
    Task<LocalState> LoadStateAsync(GameInstance instance);
    Task SaveStateAsync(GameInstance instance, LocalState state);
    Task<LocalState> LoadStateByPathAsync(string instanceRootPath);
    Task SaveStateByPathAsync(string instanceRootPath, LocalState state);
}