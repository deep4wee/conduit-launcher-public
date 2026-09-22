using System;

namespace ConduitLauncher.Domain.Entities;

public readonly record struct InstanceId(Guid Value)
{
    public static InstanceId New() => new(Guid.NewGuid());
    public static InstanceId Empty => new(Guid.Empty);
}

public readonly record struct AccountId(Guid Value)
{
    public static AccountId New() => new(Guid.NewGuid());
    public static AccountId Empty => new(Guid.Empty);
}
    