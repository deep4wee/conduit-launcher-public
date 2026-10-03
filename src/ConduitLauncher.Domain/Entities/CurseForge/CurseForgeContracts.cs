using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ConduitLauncher.Domain.Entities.CurseForge;

public class CurseForgeMod
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("gameId")]
    public int GameId { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("slug")]
    public string Slug { get; set; } = string.Empty;

    [JsonPropertyName("links")]
    public CurseForgeLinks? Links { get; set; }

    [JsonPropertyName("summary")]
    public string Summary { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public int Status { get; set; }

    [JsonPropertyName("downloadCount")]
    public long DownloadCount { get; set; }

    [JsonPropertyName("isFeatured")]
    public bool IsFeatured { get; set; }

    [JsonPropertyName("primaryCategoryId")]
    public int PrimaryCategoryId { get; set; }

    [JsonPropertyName("categories")]
    public List<CurseForgeCategory> Categories { get; set; } = new();

    [JsonPropertyName("classId")]
    public int ClassId { get; set; }

    [JsonPropertyName("authors")]
    public List<CurseForgeAuthor> Authors { get; set; } = new();

    [JsonPropertyName("logo")]
    public CurseForgeAttachment? Logo { get; set; }

    [JsonPropertyName("screenshots")]
    public List<CurseForgeAttachment> Screenshots { get; set; } = new();

    [JsonPropertyName("mainFileId")]
    public long MainFileId { get; set; }

    [JsonPropertyName("latestFiles")]
    public List<CurseForgeFile> LatestFiles { get; set; } = new();

    [JsonPropertyName("latestFilesIndexes")]
    public List<CurseForgeFileIndex> LatestFilesIndexes { get; set; } = new();

    [JsonPropertyName("dateCreated")]
    public DateTime DateCreated { get; set; }

    [JsonPropertyName("dateModified")]
    public DateTime DateModified { get; set; }

    [JsonPropertyName("dateReleased")]
    public DateTime DateReleased { get; set; }

    [JsonPropertyName("allowModDistribution")]
    public bool? AllowModDistribution { get; set; }

    [JsonPropertyName("gamePopularityRank")]
    public int GamePopularityRank { get; set; }

    [JsonPropertyName("isAvailable")]
    public bool IsAvailable { get; set; } = true;
}

public class CurseForgeLinks
{
    [JsonPropertyName("websiteUrl")]
    public string? WebsiteUrl { get; set; }

    [JsonPropertyName("wikiUrl")]
    public string? WikiUrl { get; set; }

    [JsonPropertyName("issuesUrl")]
    public string? IssuesUrl { get; set; }

    [JsonPropertyName("sourceUrl")]
    public string? SourceUrl { get; set; }
}

public class CurseForgeCategory
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("gameId")]
    public int GameId { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("slug")]
    public string Slug { get; set; } = string.Empty;

    [JsonPropertyName("iconUrl")]
    public string? IconUrl { get; set; }

    [JsonPropertyName("dateModified")]
    public DateTime DateModified { get; set; }

    [JsonPropertyName("isClass")]
    public bool IsClass { get; set; }

    [JsonPropertyName("classId")]
    public int? ClassId { get; set; }

    [JsonPropertyName("parentCategoryId")]
    public int? ParentCategoryId { get; set; }
}

public class CurseForgeAuthor
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("url")]
    public string? Url { get; set; }
}

public class CurseForgeAttachment
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("modId")]
    public long ModId { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("thumbnailUrl")]
    public string? ThumbnailUrl { get; set; }

    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;
}

public class CurseForgeFile
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("gameId")]
    public int GameId { get; set; }

    [JsonPropertyName("modId")]
    public long ModId { get; set; }

    [JsonPropertyName("isAvailable")]
    public bool IsAvailable { get; set; } = true;

    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonPropertyName("fileName")]
    public string FileName { get; set; } = string.Empty;

    [JsonPropertyName("releaseType")]
    public int ReleaseType { get; set; } // 1 = Release, 2 = Beta, 3 = Alpha

    [JsonPropertyName("fileStatus")]
    public int FileStatus { get; set; }

    [JsonPropertyName("hashes")]
    public List<CurseForgeFileHash> Hashes { get; set; } = new();

    [JsonPropertyName("fileDate")]
    public DateTime FileDate { get; set; }

    [JsonPropertyName("fileLength")]
    public long FileLength { get; set; }

    [JsonPropertyName("downloadCount")]
    public long DownloadCount { get; set; }

    [JsonPropertyName("downloadUrl")]
    public string? DownloadUrl { get; set; }

    [JsonPropertyName("gameVersions")]
    public List<string> GameVersions { get; set; } = new();

    [JsonPropertyName("sortableGameVersions")]
    public List<CurseForgeSortableGameVersion> SortableGameVersions { get; set; } = new();

    [JsonPropertyName("dependencies")]
    public List<CurseForgeFileDependency> Dependencies { get; set; } = new();
}

public class CurseForgeFileIndex
{
    [JsonPropertyName("gameVersion")]
    public string GameVersion { get; set; } = string.Empty;

    [JsonPropertyName("fileId")]
    public long FileId { get; set; }

    [JsonPropertyName("filename")]
    public string Filename { get; set; } = string.Empty;

    [JsonPropertyName("releaseType")]
    public int ReleaseType { get; set; }

    [JsonPropertyName("modLoader")]
    public int? ModLoader { get; set; }
}

public class CurseForgeFileHash
{
    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;

    [JsonPropertyName("algo")]
    public int Algo { get; set; } // 1 = SHA1, 2 = MD5
}

public class CurseForgeSortableGameVersion
{
    [JsonPropertyName("gameVersionName")]
    public string GameVersionName { get; set; } = string.Empty;

    [JsonPropertyName("gameVersionPadded")]
    public string GameVersionPadded { get; set; } = string.Empty;

    [JsonPropertyName("gameVersion")]
    public string GameVersion { get; set; } = string.Empty;

    [JsonPropertyName("gameVersionReleaseDate")]
    public DateTime? GameVersionReleaseDate { get; set; }
}

public class CurseForgeFileDependency
{
    [JsonPropertyName("modId")]
    public long ModId { get; set; }

    [JsonPropertyName("relationType")]
    public int RelationType { get; set; } // 1=EmbeddedLibrary, 2=OptionalDependency, 3=RequiredDependency, 4=Tool, 5=Incompatible, 6=Include
}

public class CurseForgePagination
{
    [JsonPropertyName("index")]
    public int Index { get; set; }

    [JsonPropertyName("pageSize")]
    public int PageSize { get; set; }

    [JsonPropertyName("resultCount")]
    public int ResultCount { get; set; }

    [JsonPropertyName("totalCount")]
    public long TotalCount { get; set; }
}

public class CurseForgeResponse<T>
{
    [JsonPropertyName("data")]
    public T Data { get; set; } = default!;
}

public class CurseForgeSearchResponse
{
    [JsonPropertyName("data")]
    public List<CurseForgeMod> Data { get; set; } = new();

    [JsonPropertyName("pagination")]
    public CurseForgePagination? Pagination { get; set; }
}

public class CurseForgeFilesResponse
{
    [JsonPropertyName("data")]
    public List<CurseForgeFile> Data { get; set; } = new();

    [JsonPropertyName("pagination")]
    public CurseForgePagination? Pagination { get; set; }
}

public enum CurseForgeModLoaderType
{
    Any = 0,
    Forge = 1,
    Cauldron = 2,
    LiteLoader = 3,
    Fabric = 4,
    Quilt = 5,
    NeoForge = 6
}
