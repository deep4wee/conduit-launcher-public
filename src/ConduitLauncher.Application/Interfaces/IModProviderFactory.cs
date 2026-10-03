namespace ConduitLauncher.Application.Interfaces;

public interface IModProviderFactory
{
    IModProvider GetProvider(string? source = null);
}
