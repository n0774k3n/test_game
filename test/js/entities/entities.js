game.PlayerEntity = me.ObjectEntity.extend({

	init: function(x,y,settings)
	{
		this.parent(x,y,settings);
		
		this.setVelocity(3, 3);

		this.updateColRect(-1,0,15,17)
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
		if(res.obj.type == me.game.LEVEL_ENTITY)
		{
			console.log('ok');
		}
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

		player.in_battle = true;
	},

	update: function ()
	{
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
		context.beginPath();
		context.lineWidth='2';
		context.strokeStyle='green';
		context.rect(this.pos.x, this.pos.y, this.width, this.height);
		context.stroke();

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
