const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs);
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const Session = new Schema({
  refreshToken: {
    type: String,
    default: "",
  },
})

const UserSchema = new mongoose.Schema({
	firstName: {
		type: String,
		default: "",
  	},
	lastName: {
		type: String,
		default: "",
	 },
	email: {
      type: String,
      unique: true
    },
    profileImageUrl: {
      type:String,
    },
    decks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck'
    }],
	authStrategy: {
		type: String,
		default: "local",
  },
	refreshToken: {
    	type: [Session],
  },
});


/* ----TO BE IMPLEMENTED THE BELOW CODE FOR AUTHORIZATION 
userSchema.pre('save', function(next){
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, 10).then(function(hashedPassword) {
      user.password = hashedPassword
      next();
  }, function(err){
    return next(err)
  });
});

userSchema.methods.comparePassword = function(candidatePassword, next) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return next(err);
    next(null, isMatch);
  });
};
*/

//Remove refreshToken from the response
UserSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.refreshToken
    return ret
  },
})

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', UserSchema);
module.exports = User;