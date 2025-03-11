import axios from "axios"

export default new class Github {
    constructor() {
        this.baseUrl = ""
    }

    async stalk(user) {
        return new Promise(async (resolve, reject) => {
            const { data } = await axios.get('https://api.github.com/users/'+ user )

            resolve({
                username: data.login,
                nickname: data.name,
                bio: data.bio,
                id: data.id,
                nodeId: data.node_id,
                profile_pic: data.avatar_url,
                url: data.html_url,
                type: data.type,
                admin: data.site_admin,
                company: data.company,
                blog: data.blog,
                location: data.location,
                email: data.email,
                public_repo: data.public_repos,
                public_gists: data.public_gists,
                followers: data.followers,
                following: data.following,
                ceated_at: data.created_at,
                updated_at: data.updated_at
            })
        })
    }
}