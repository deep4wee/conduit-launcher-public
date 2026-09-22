export interface ModDetails {
    id: string;
    slug: string;
    title: string;
    description: string;
    body: string;
    icon_url: string;
    downloads: number;
    followers: number;
    client_side: string;
    server_side: string;
    published: string;
    updated: string;
    categories: string[];
    license: { id: string; name: string; url: string };
    source_url?: string;
    issues_url?: string;
    wiki_url?: string;
    project_type: string;
    gallery?: { url: string; featured: boolean; title?: string; description?: string }[];
}

export interface ModVersion {
    id: string;
    name: string;
    version_number: string;
    version_type: 'release' | 'beta' | 'alpha';
    loaders: string[];
    game_versions: string[];
    date_published: string;
    downloads: number;
    changelog?: string;
    files: { url: string, filename: string, primary: boolean, size?: number }[];
    dependencies?: { version_id: string | null, project_id: string | null, dependency_type: string }[];
}

export interface TeamMember {
    team_id: string;
    user: { id: string, username: string, name: string, avatar_url: string };
    role: string;
}

export interface DependencyProject {
    id: string;
    title: string;
    icon_url: string;
    project_type: string;
}

export interface ModrinthProject {
    project_id: string;
    title: string;
    description: string;
    icon_url: string;
    downloads: number;
    author: string;
    project_type: string;
    display_categories: string[];
    client_side?: string;
    server_side?: string;
    date_modified?: string;
}
            
            
    