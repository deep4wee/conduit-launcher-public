namespace ConduitLauncher.Application.Interfaces;

public interface ICredentialStore
{
    string Encrypt(string plainText);
    string Decrypt(string cipherText);
}
