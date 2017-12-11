var dbConstants = {
    getTaskStatusOptions: function(){
        return [
            { name: 'incomplete' },
            { name: 'in progress' },
            { name: 'completed' },
            { name: 'skipped' }
        ];
    }
};

module.exports = dbConstants;