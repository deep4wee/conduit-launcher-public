using System.Threading.Tasks;

namespace ConduitLauncher.Application.Interfaces;

public interface IModProvider
{
    Task<string> SearchProjectsAsync(string query, string facets, string sort, int offset, int limit);
    Task<string> GetTagsAsync(string tagType);
    
    Task<string> GetProjectDetailsAsync(string projectId);
    Task<string> GetProjectVersionsAsync(string projectId, string gameVersion, string loader);
    Task<string> GetVersionAsync(string versionId);
    Task<string> GetVersionByHashAsync(string hash, string algorithm = "sha1");
    
    Task<string> GetProjectTeamAsync(string projectId);
    Task<string> GetProjectsBulkAsync(System.Collections.Generic.IEnumerable<string> projectIds);
}
            
            
            
    