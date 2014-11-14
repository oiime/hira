module.exports = function (orm, db) {
  var Tag = db.define('tag', {
    type      : { type: 'text', required: true },
    name      : { type: 'text', required: true },
    data      : { type: 'object'}
  },
  {
    hooks: {
      beforeCreate: function () {
        if (this.data !== null && typeof this.data === 'object') {
          this.data = JSON.stringify(this.data);
        }
      }
    },
    methods: {
      serialize: function () {
        return {
          id        : this.id,
          name      : this.name,
          type      : this.type,
          data      : this.data
        }
      }
    }
  });
  Tag.nameMap = function(cb){
    var umap = {};
    this.find({}, function(err, rows){
      rows.forEach(function(row){
        umap[row.id] = {name: row.name, type: row.type};
      });
      cb(umap);
    });
  }
  Tag.finder = function(params, cb) {
    this.find(params, function(err, data){
      if(err){
        throw err;
      }
      cb(null, data.map(function(entry){ return entry.serialize()}))

    });
  };
  Tag.safeSave = function(tag, cb){
    if(tag.id > 0){
      this.get(tag.id, function(err, row){
        row.name = tag.name;
        row.type = tag.type;
        row.data = tag.data;
        row.save(function(err){
          cb(err, row);
        });
      });
    }
    else {
      this.create([tag], function(err, rows){
        if(err){
          cb(err);
        } else {
          cb(null, rows[0]);
        }
      });
    }
  }
};
