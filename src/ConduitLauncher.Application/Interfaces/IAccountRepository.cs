using System.Collections.Generic;
using System.Threading.Tasks;
using ConduitLauncher.Domain.Entities;
using ConduitLauncher.Domain.Shared;

namespace ConduitLauncher.Application.Interfaces;

public interface IAccountRepository
{
    Task<List<AccountProfile>> GetAccountsAsync();
    Task<Result<AccountProfile>> GetAccountAsync(AccountId id);
    Task<Result> SaveAccountAsync(AccountProfile account);
    Task<Result> DeleteAccountAsync(AccountId id);
}
