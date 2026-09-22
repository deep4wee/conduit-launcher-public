using System;
using ConduitLauncher.Domain.Enums;
using ConduitLauncher.Domain.Shared;

namespace ConduitLauncher.Domain.Entities;

public sealed class AccountProfile
{
    public AccountId Id { get; private set; }
    public string Username { get; private set; }
    public AccountType Type { get; private set; }
    public string AccessToken { get; private set; }

    private AccountProfile(AccountId id, string username, AccountType type, string accessToken)
    {
        Id = id;
        Username = username;
        Type = type;
        AccessToken = accessToken;
    }

    public static AccountProfile Restore(Guid id, string username, AccountType type, string accessToken)
    {
        return new AccountProfile(new AccountId(id), username, type, accessToken);
    }

    public static Result<AccountProfile> CreateOffline(string username)
    {
        if (string.IsNullOrWhiteSpace(username))
            return Result<AccountProfile>.Failure(new Error("Account.EmptyUsername", "Username cannot be empty for offline accounts."));

        return Result<AccountProfile>.Success(new AccountProfile(AccountId.New(), username, AccountType.Offline, string.Empty));
    }

    public static Result<AccountProfile> CreateMicrosoft(string username, string accessToken)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
            return Result<AccountProfile>.Failure(new Error("Account.EmptyToken", "Microsoft account requires an access token."));

        return Result<AccountProfile>.Success(new AccountProfile(AccountId.New(), username, AccountType.Microsoft, accessToken));
    }

    public static Result<AccountProfile> CreateModrinth(string username, string apiKey)
    {
        if (string.IsNullOrWhiteSpace(apiKey))
            return Result<AccountProfile>.Failure(new Error("Account.EmptyToken", "Modrinth account requires an API key."));

        return Result<AccountProfile>.Success(new AccountProfile(AccountId.New(), username, AccountType.Modrinth, apiKey));
    }
    
    // Allow updating token securely
    public void UpdateToken(string token)
    {
        AccessToken = token;
    }
}
    