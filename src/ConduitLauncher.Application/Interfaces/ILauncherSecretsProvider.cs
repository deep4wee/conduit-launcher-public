namespace ConduitLauncher.Application.Interfaces;

public interface ILauncherSecretsProvider
{

    string GetMicrosoftClientId();

    string GetCurseForgeProxyUrl();
}
    