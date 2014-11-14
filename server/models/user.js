var config = require('../config/environment');
var c = require('../const');
var moment = require('moment');
var bcrypt = require('bcrypt');

module.exports = function (orm, db) {
  var User = db.define('user', {
    name      : { type: 'text', required: true },
    email     : { type: 'text', required: true },
    org       : { type: 'text' },
    role      : { type: 'integer', required: true },
    status    : { type: 'integer'},
    password  : { type: 'text'},
    createdAt : { type: 'date', time: true }
  },
  {
    hooks: {
      beforeCreate: function () {
        if (this.password) {
          this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
        }
      },
      beforeValidation: function () {
        this.createdAt = new Date();
      }
    },
    validations: {
      name   : orm.enforce.ranges.length(1, 64)
    },
    methods: {
      comparePassword: function(raw){
      	return bcrypt.compareSync(raw, this.password);
      },
      serialize: function () {
        return {
          id        : this.id,
          name      : this.name,
	        email     : this.email,
          org       : this.org,
          role      : this.role,
          createdAt : this.createdAt
        }
      }
    }
  });
  User.getMappedAll = function(cb){
    var users = {};
    this.find({}, function(err, rows){
      rows.forEach(function(row){
        users[row.id] = row.serialize();
      });
      cb(users);
    });
  };
  User.safeSave = function(data, cb){
    this.create([{
      role: c.ROLE_USER,
      name: data.name,
      email: data.email,
      org: data.org,
      password: data.password
    }], function(err, rows){
      if(err) throw err;
      cb(null, rows[0]);
    });
  }
  User.findByEmailPassword = function(email, password, cb){
  	User.find({email: email}, function(err, users){
		if(err){
			throw err;
		}
		if(users.length === 0){
			cb(null, null);
		}
		else if(users[0].comparePassword(password)){
			cb(null, users[0]);
		}
		else {
			cb(null, null);
		}
	})
  }
  User.finder = function(params, cb){
    var sql = '';
    var counter = false;
    var placeholders = [];
    var fields = ['email','id','name','status','org'];
    var where = [
      'status IN (' + c.STATUS_ACTIVE + ',' + c.STATUS_INACTIVE + ')'
    ];
    if(typeof params._meta !== 'undefined' && typeof params._meta.count !== 'undefined' && params._meta.count===true){
      counter = true;
    }
    if(counter){
      fields = ['COUNT(DISTINCT id) AS counter'];
    }
    sql  = 'SELECT ' + fields.join(',') + ' FROM user WHERE ' + where.join(' AND ');

    if(typeof params._meta !== 'undefined' && typeof params._meta.limit !== 'undefined' && typeof params._meta.limit.limit !== 'undefined' && typeof params._meta.limit.offset !== 'undefined'){
      sql += ' LIMIT ' + parseInt(params._meta.limit.offset) + ',' + parseInt(params._meta.limit.limit)
    }
    db.driver.execQuery(sql,placeholders, function(err, rows){
      if(err) throw err;
      if(counter){
        cb(null, {_meta : { count : rows[0].counter}});
        return;
      }
      cb(null, { records: rows} );
    });
  };
};
