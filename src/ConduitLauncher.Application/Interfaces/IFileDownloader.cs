using System.Collections.Generic;
using System.Threading.Tasks;
namespace ConduitLauncher.Application.Interfaces;
public interface IFileDownloader
{
Task DownloadFilesAsync(IEnumerable<string> urls, string destinationFolder);
}