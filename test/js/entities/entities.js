game.PlayerEntity = me.ObjectEntity.extend({

	init: function(x,y,settings)
	{
		this.parent(x,y,settings);

		this.setVelocity(3, 3);

		this.updateColRect(5,27,16,16)
		this.startPos(1504,608);

		this.in_battle = false;

		this.direction = 'down';
		this.renderable.addAnimation('down', [1,2,1,0]);
		this.renderable.addAnimation('left', [4,5,4,3]);
		this.renderable.addAnimation('right', [7,8,7,6]);
		this.renderable.addAnimation('up', [10,11,10,9]);

		this.renderable.setCurrentAnimation(this.direction);

		me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

	},

	update: function()
	{
		var _k  = me.input.isKeyPressed;

		this.vel.x = 0;
		this.vel.y = 0;

		var UP = false,
			DOWN = false,
			LEFT = false,
			RIGHT = false,
			RUN = false,
			SPEED = 3,
			RUN_SPEED = 5,
			VEL = 0;

		if(_k('up'))
		{
			if(UP == false) UP = true;
		}
		else 
		{
			UP = false;
		}
		if(_k('down'))
		{
			if(DOWN == false) DOWN = true;
		}
		else 
		{
			DOWN = false;
		}
		if(_k('left'))
		{
			if(LEFT == false) LEFT = true;
		}
		else 
		{
			LEFT = false;
		}
		if(_k('right'))
		{
			if(RIGHT == false) RIGHT = true;
		}
		else 
		{
			RIGHT = false;
		}
		if(_k('run'))
		{
			if(RUN == false) {
				RUN = true;
			}
			else  
			{
				RUN = false;
			}
		}

		if(RUN == true)
		{
			this.setVelocity(RUN_SPEED,RUN_SPEED);
		}
		if(RUN == false)
		{
			this.setVelocity(SPEED,SPEED);
		}

		if(UP)
		{
			this.vel.y -= this.accel.y * me.timer.tick;
			this.renderable.setCurrentAnimation('up');
		}
		if(DOWN)
		{
			this.vel.y += this.accel.y * me.timer.tick;
			this.renderable.setCurrentAnimation('down');
		}
		if(LEFT)
		{
			this.vel.x -= this.accel.x * me.timer.tick;
			this.renderable.setCurrentAnimation('left');
		}
		if(RIGHT)
		{
			this.vel.x += this.accel.x * me.timer.tick;
			this.renderable.setCurrentAnimation('right');
		}


		var res = me.game.collide(this);
		//console.log(me.game);
		/*
		if(res)	{
			console.log(res);
		}
		*/
		this.updateMovement();
		/*
		this.timer = 0;
		this.timer += me.timer.tick;
		console.log(this.timer);
		while(this.timer >= 240)
		{
			me.game.add(new BattleField());
			me.game.sort();
			this.timer -= 240;
		}
		*/
		if(!this.in_battle &&
			(UP || DOWN || LEFT || RIGHT) &&
			(Math.floor(Math.random() * 25)) === 0)
		{
			var bf = new BattleField(this);
			me.game.add(bf, this.z);
			me.game.sort();
		}


		if(this.vel.x != 0 || this.vel.y != 0)
		{
			this.parent();
			return true;
		}

		return false;
	},

	startPos: function(newX,newY)
	{
		this.pos.x = newX;
		this.pos.y = newY;
	},

	onCollision: function(res, obj)
	{
		console.log(this)
		console.log("Collision");
	}
});

var BattleField = me.ObjectEntity.extend({

	init: function(player)
	{
		//init battle
		console.log('battle');
		var vp = me.game.viewport.pos;
		this.parent(vp.x + 64, vp.y + 64, {
			spritewidth: me.video.getWidth() - 128,
			spriteheight: me.video.getHeight() - 128,
		});
		this.player = player;
		this.z = player.z;
		this.monsters = [];

		player.in_battle = true;

		//place enemy
		var numMons = Number.prototype.random(1,3);
		for(var num = 1; num <= numMons; num++)
		{ 
			var r_pos = new me.Vector2d();
		    var good = false;
				while(good == false)
				{
	        		r_pos.x = Number.prototype.random(this.pos.x, (this.pos.x + this.width) - 32) ;
	        		r_pos.y = Number.prototype.random(this.pos.y, this.pos.y + this.height);
	        		var mon = new game.Slime(r_pos.x, r_pos.y);
					var col = mon.collisionMap.checkCollision(mon.collisionBox, mon.vel);
					if(col.yprop.isSolid || col.xprop.isSolid)
					{
						console.log('COLLIDING!');
						me.game.remove(mon);
						continue;
					}
	        		good = true;
				}
				console.log(r_pos);
			
			me.game.add(mon, this.z);

			this.monsters.push(mon);

			mon.battleField = this;
		}

		me.game.sort();
	},

	update: function ()
	{
		var pos = this.player.pos;
		pos.x = pos.x.clamp(this.left, this.right - this.player.width);
		pos.y = pos.y.clamp(this.top, this.bottom - this.player.height);
		return true;
	},

	onDestroyEvent: function ()
	{
		this.player.in_battle = false;
	},

	getBorders: function()
	{
		//make the battle borders maybe draw a rectangle
	},

	draw: function(context)
	{

		context.strokeStyle='blue';
		context.lineWidth=2;
		context.save();
		context.globalAlpha = .25;
		context.fillStyle = 'green';
		context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		context.restore();
		context.strokeRect(this.pos.x, this.pos.y, this.width, this.height);
	}
});


var MyLevelEntity = me.LevelEntity.extend({

	init: function(x,y,settings)
	{
		this.parent(x,y,settings);

		this.settings = settings;

		this.to = settings.to;

		this.fade = settings.fade;
		this.duration = settings.duration;

		this.fading = false;
	},

	onCollision: function()
	{
		this.goTo();
	},

	goTo: function()
	{
		if(this.fade && this.duration)
		{
			if(!this.fading)
			{
				this.fading = true;
				me.game.viewport.fadeIn(this.fade, 
										this.duration, 
										this.onFadeComplete.bind(this));

			}

		}
		else
		{
			me.levelDirector.loadLevel(this.to);
		}

	},
	onFadeComplete: function()
	{
		me.levelDirector.loadLevel(this.to);
		me.game.viewport.fadeOut(this.fade,this.duration);

		var player = me.game.getEntityByName('player')[0];

		player.pos.x = this.settings.locationX * 32;
		player.pos.y = this.settings.locationY * 32;
	}
});

var SpawnPoint = me.ObjectEntity.extend({
	init: function(x,y,settings)
	{
		this.parent(x,y,settings);

		this.limit = settings.spawnLimit;
		this.canSpawn = settings.canSpawn;
		this.monsterCount = 0;
		this.spawnTime = settings.spawnTime;

		this.player = me.game.getEntityByName('player')[0];


		this.timer = 0;
	},
	update: function()
	{

		this.timer += me.timer.tick;
		if(this.timer >= this.spawnTime && !this.player.in_battle)
		{
			if(this.monsterCount < this.limit)
			{
				console.log(game[this.canSpawn]);
				var r_pos = new me.Vector2d();

	        	r_pos.x = Number.prototype.random(this.pos.x, (this.pos.x + this.width) - 32) ;
	        	r_pos.y = Number.prototype.random(this.pos.y, this.pos.y + this.height);
				var enemy = new game[this.canSpawn](r_pos.x,r_pos.y);
				me.game.add(enemy, this.z);
				me.game.sort();

				enemy.spawnArea = this;
				enemy.spanwed = true;

				this.monsterCount++;
			}
			this.timer -= this.spawnTime;
		}
		return false;
	}
})

game.Slime = me.ObjectEntity.extend({

	init: function(x,y)
	{
		settings = {};
		settings.image = 'monster';
		settings.spriteheight = 32;
		settings.spritewidth = 32; 
		this.parent(x,y,settings);

		this.spawned = false;
		this.spawnArea = undefined;

		this.battleField = undefined;

		this.setVelocity(1, 1);
		this.toX = this.pos.x;
		this.toY = this.pos.y;

		this.updateColRect(5,27,16,16)

		this.agressive = true;
		this.checkTime = 50;
		this.nextCheck = 0;
		this.in_battle = false;
		this.chaser = true;
		this.target = undefined;

		this.direction = 'down';
		this.renderable.addAnimation('down', [7,6,7,8]);
		this.renderable.addAnimation('left', [19,20,19,18]);
		this.renderable.addAnimation('right', [31,32,31,30]);
		this.renderable.addAnimation('up', [43,44,43,42]);

		this.renderable.setCurrentAnimation(this.direction);

	},
	update: function()
	{
		this.vel.x = 0;
		this.vel.y = 0;

		var sa = this.spawnArea || this.battleField;

		var UP = false,
			DOWN = false,
			LEFT = false,
			RIGHT = false,
			SPEED = 1,
			RUN_SPEED = 2,
			VEL = 0;

		this.run = false,

		this.checkAI();
		if(this.target == undefined && (Math.floor(Math.random() * 250)) === 0)
		{
			
			this.toX = Number.prototype.random(sa.pos.x, (sa.pos.x + sa.width) - this.width);
			this.toY = Number.prototype.random(sa.pos.y, (sa.pos.y + sa.height)) ;

			// Normalize destination vector
			this.toX += -(this.toX % this.accel.x) + (this.pos.x % this.accel.x);
			this.toY += -(this.toY % this.accel.y) + (this.pos.y % this.accel.y);
			console.log("to x "+this.toX+" to y "+this.toY);
		}
		if(this.target)
		{
			this.toX = this.target.pos.x;
			this.toY = this.target.pos.y;

			// Normalize destination vector
			this.toX += -(this.toX % this.accel.x) + (this.pos.x % this.accel.x);
			this.toY += -(this.toY % this.accel.y) + (this.pos.y % this.accel.y);
		}

		if(this.toX != this.pos.x || this.toY != this.pos.y)
		{
			if(this.pos.x < this.toX)
			{
				RIGHT = true;
			} else
			if(this.pos.x > this.toX)
			{
				LEFT = true;
			}
			if(this.pos.y > this.toY)
			{
				UP = true;
			} else
			if(this.pos.y < this.toY)
			{
				DOWN = true;
			}
			if(this.run == true)
			{
				this.setVelocity(RUN_SPEED,RUN_SPEED);
			}
			if(this.run == false)
			{
				this.setVelocity(SPEED,SPEED);
			}

			if(UP)
			{
				this.vel.y = -this.accel.y * me.timer.tick;
				this.renderable.setCurrentAnimation('up');
			}
			if(DOWN)
			{
				this.vel.y = this.accel.y * me.timer.tick;
				this.renderable.setCurrentAnimation('down');
			}
			if(LEFT)
			{
				this.vel.x = -this.accel.x * me.timer.tick;
				this.renderable.setCurrentAnimation('left');
			}
			if(RIGHT)
			{
				this.vel.x = this.accel.x * me.timer.tick;
				this.renderable.setCurrentAnimation('right');
			}
		}
		this.updateMovement();
		return true;
	},

	checkAI: function()
	{
		//enemy search
		if(this.agressive == true)
		{
			this.nextCheck += me.timer.tick;
			if(this.nextCheck >= this.checkTime)
			{
				var target = (this.spawned) ? this.spawnArea.player : this.battleField.player;
				var distance = this.distanceTo(target);
				console.log(distance);

				if(distance <= 150)
				{
					this.target = target;
				}

				this.nextCheck -= this.checkTime;
			}

		}

		if(this.target)
		{
			if(this.distanceTo(this.target) <= 75 && this.chaser == true)
			{
				this.run = true;

			}

			if(this.distanceTo(this.target) > 300)
			{
				this.target = undefined;
			}
		}

	}
})