<template>
    <div>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <a class="navbar-brand" href="/">Navbar</a>
            <button class="navbar-toggler" type="button"
                    data-toggle="collapse"
                    data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item">
                        <router-link class="nav-link" :to="{ name: 'home'}">Home</router-link>
                    </li>
                    <li>
                        <router-link class="nav-link" :to="{ name: 'artifactSnapper'}">Artifact Snapper</router-link>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
</template>

<script>
export default {
    name: 'Navbar',
    data: () => ({
        user: false,
        username: null,
    }),
    mounted() {
    },
    methods: {
    },
    computed: {
    },
};
</script>