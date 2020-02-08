module.exports = {
    docName: 'configuration',
    read: {
        permissions: false,
        query() {
            return [{
                useGravatar: true,
                blogUrl: '',
                blogTitle: '',
                enableDeveloperExperiments: true,
                clientId: 'ghost-admin',
                clientSecret: ''
            }];
        }
    }
};
