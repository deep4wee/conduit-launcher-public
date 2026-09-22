
using System;
using ConduitLauncher.Domain.Enums;
using ConduitLauncher.Domain.Shared;
using System;
namespace ConduitLauncher.Domain.Entities;

public sealed class GameInstance
{
    public InstanceId Id { get; private set; }
    public string Name { get; private set; }
    public string MinecraftVersion { get; private set; }
    public string RootPath { get; private set; }
    public ModStorageMode StorageMode { get; private set; }
    
    public string LoaderType { get; private set; }
    public string LoaderVersion { get; private set; }
    public string? IconBase64 { get; private set; }

    private GameInstance(InstanceId id, string name, string minecraftVersion, string rootPath, ModStorageMode storageMode, string loaderType, string loaderVersion, string? iconBase64)
    {
        Id = id;
        Name = name;
        MinecraftVersion = minecraftVersion;
        RootPath = rootPath;
        StorageMode = storageMode;
        LoaderType = loaderType;
        LoaderVersion = loaderVersion;
        IconBase64 = iconBase64;
    }

    public static Result<GameInstance> Create(string name, string minecraftVersion, string rootPath, string loaderType = "Vanilla", string loaderVersion = "", string? iconBase64 = null, ModStorageMode storageMode = ModStorageMode.Isolated)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result<GameInstance>.Failure(new Error("Instance.EmptyName", "Instance name cannot be empty."));
        if (string.IsNullOrWhiteSpace(minecraftVersion))
            return Result<GameInstance> .Failure(new Error("Instance.EmptyVersion", "Minecraft version must be specified."));
        if (string.IsNullOrWhiteSpace(rootPath))
            return Result<GameInstance>.Failure(new Error("Instance.EmptyPath", "Root path cannot be empty."));

        return Result<GameInstance>.Success(new GameInstance(InstanceId.New(), name, minecraftVersion, rootPath, storageMode, loaderType, loaderVersion, iconBase64));
    }
}
    