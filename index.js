const Jumper = function() {};
Jumper.Play = function() {};

Jumper.Play.prototype = {

    init: function() {
        this.maxPlatformsPassed = localStorage.getItem('maxPlatformsPassed') || 0;
        this.currentPlatformsPassed = 0;
    },
    
  preload: function() {
    this.load.spritesheet('hero', 'assets/woof.png', 32, 32);
    this.load.image( 'pixel', 'assets/ground_cake_small.png' );
    this.load.audio('jump', 'assets/jump.mp3');
    this.load.audio('fall', 'assets/fall.mp3');
  },

  create: function() {
    this.stage.backgroundColor = '87cefa';
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.scale.setGameSize(this.game.width, this.game.height);

    this.physics.startSystem( Phaser.Physics.ARCADE );

    this.cameraYMin = 99999;
    this.platformYMin = 99999;

    this.jumpSound = null;

    this.jumpSound = this.game.add.audio('jump');
    this.fallSound = this.game.add.audio('fall');

    this.platformsCreate();

    this.heroCreate();

    this.hero.animations.add('left', [0, 1], 10, true)
    this.hero.animations.add('right', [2, 3], 10, true)

    this.cursor = this.input.keyboard.createCursorKeys();

    this.world.setBounds(0, 0, this.world.width, this.game.height);

    this.maxCounterText = this.game.add.text(20, 20, '', { font: '18px Arial', fill: '#fff', fontWeight: '500' });
    this.currentCounterText = this.game.add.text(20, 20, '', { font: '18px Arial', fill: '#fff', fontWeight: '500' });
    this.maxCounterText.setText(this.maxPlatformsPassed);
    this.currentCounterText.setText(this.currentPlatformsPassed);
  },

  update: function() {

    this.world.setBounds( 0, -this.hero.yChange, this.world.width, this.game.height + this.hero.yChange );

    this.cameraYMin = Math.min( this.cameraYMin, this.hero.y - this.game.height + 130 );
    this.camera.y = this.cameraYMin;

    this.physics.arcade.collide( this.hero, this.platforms );
    this.heroMove();

    this.platforms.forEachAlive( function( elem ) {
        this.platformYMin = Math.min( this.platformYMin, elem.y );
        if( elem.y > this.camera.y + this.game.height ) {
          elem.kill();
          const newPlatform = this.platformsCreateOne( this.rnd.integerInRange( 0, this.world.width - 50 ), this.platformYMin - 100, 50 );
          if (newPlatform.y < this.hero.y) {
            this.currentPlatformsPassed++;
            this.maxPlatformsPassed = Math.max(this.maxPlatformsPassed, this.currentPlatformsPassed);
            localStorage.setItem('maxPlatformsPassed', this.maxPlatformsPassed);
          }
        }
      }, this );

      this.maxCounterText.setText('Максимальна кількість платформ: ' + this.maxPlatformsPassed);
      this.currentCounterText.setText('Поточна кількість платформ: ' + this.currentPlatformsPassed);
      this.maxCounterText.y = this.camera.y + 10;
      this.currentCounterText.y = this.camera.y + 40;

      if (this.hero.y > this.cameraYMin + this.game.height) {
        this.fallSound.play();
        this.game.state.restart();
    }
  },

  shutdown: function() {
    this.world.setBounds( 0, 0, this.game.width, this.game.height );
    this.cursor = null;
    this.hero.destroy();
    this.hero = null;
    this.platforms.destroy();
    this.platforms = null;
  },

  platformsCreate: function() {
    this.platforms = this.add.group();
    this.platforms.enableBody = true;
    this.platforms.createMultiple( 15, 'pixel' );
    this.platformsCreateOne( -15, this.world.height - 16, this.world.width + 16 );
    for( let i = 0; i < 14; i++ ) {
      this.platformsCreateOne( this.rnd.integerInRange( 0, this.world.width - 50 ), this.world.height - 100 - 50 * i, 50 );
    }
},

platformsCreateOne: function(x, y, width) {
    const platform = this.platforms.getFirstDead();
    platform.reset(x, y);
    platform.scale.x = width / platform.width;
    platform.scale.y = 0.3;
    platform.body.immovable = true;
    platform.width = width;
    return platform;
  },

  heroCreate: function() {
    this.hero = game.add.sprite(32, game.world.height - 100, 'hero')
    this.hero.anchor.set( 0.5 );
 
    this.hero.yOrig = this.hero.y;
    this.hero.yChange = 0;

    this.physics.arcade.enable( this.hero );
    this.hero.body.gravity.y = 500;
    this.hero.body.checkCollision.up = false;
    this.hero.body.checkCollision.left = false;
    this.hero.body.checkCollision.right = false;
  },

  heroMove: function() {
    if( this.cursor.left.isDown ) {
      this.hero.body.velocity.x = -150;
      this.hero.animations.play('left');
    } else if( this.cursor.right.isDown ) {
      this.hero.body.velocity.x = 150;
      this.hero.animations.play('right');
    } else {
      this.hero.body.velocity.x = 0;
      this.hero.animations.stop()
    }

    if( this.cursor.up.isDown && this.hero.body.touching.down ) {
      this.hero.body.velocity.y = -350;
      this.jumpSound.play();
    } 

    if (this.hero.x < -this.hero.width / 2) {
        this.hero.x = this.game.width + this.hero.width / 2;
    } else if (this.hero.x > this.game.width + this.hero.width / 2) {
        this.hero.x = -this.hero.width / 2;
    }

    this.hero.yChange = Math.max( this.hero.yChange, Math.abs( this.hero.y - this.hero.yOrig ) );
    
    if( this.hero.y > this.cameraYMin + this.game.height && this.hero.alive ) {
      this.state.start( 'Play' );
    }
},
}
const game = new Phaser.Game( 400, 600, Phaser.CANVAS, '' );
game.state.add( 'Play', Jumper.Play );
game.state.start( 'Play' ); 
