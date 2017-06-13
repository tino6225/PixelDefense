game.PlayScreen = me.ScreenObject.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        //Set audio track
        me.audio.playTrack("level01bgm");

        // Reset Enemy settings so we'll save the proper settings for the new level
        me.game.goblinSettings = undefined;
        me.game.berserkSettings = undefined;
        me.game.impSettings = undefined;

        // Reset the score
        //game.data.gold = 125;
        game.data.gold = 999; //Dev Testing only
        game.data.playerLives = 10;
        game.data.level = 1;
        game.data.wave = 0;
        game.data.enemyStrength = 0;

        //Define and populate an object holding the enemy spawn data for this level
        game.levelData = {};
        game.levelData.waveDelay = 500;
        //Number of goblins, Goblin tick seperation, number of berserkers, berserker tick seperation, number of imps, imp tick seperation
        game.levelData.waveInfo =   [[4, 150,   0,  0,      0, 0],
                                    [4,  100,   2,  150,    0, 0],
                                    [4,  100,   3,  150,    0, 0],
                                    [10, 100,   0,  0,      0, 0],
                                    [5,  100,   5,  150,    0, 0],
                                    [3,  100,   0,  0,      1, 0],
                                    [5,  100,   10, 100,    1, 0],
                                    [10, 100,   5,  100,    2, 200],
                                    [20, 75,    5,  75,     1, 0],
                                    [15, 50,    5,  75,     3, 100]];

        //Power of Goblins,Berserkers, and Imps, respectively
        game.levelData.enemyPower = [1, 2, 3];
        game.levelData.numberWaves = game.levelData.waveInfo.length;
        game.levelData.waveStrength = [];
        for(i = 0; i<game.levelData.waveInfo.length; i++)
        {
            //Calculate the strength of the wave
            game.levelData.waveStrength.push(game.levelData.waveInfo[i][0]*game.levelData.enemyPower[0] + 
                                             game.levelData.waveInfo[i][2]*game.levelData.enemyPower[1] + 
                                             game.levelData.waveInfo[i][4]*game.levelData.enemyPower[2]);
        }

        //Set Power values to game data from the level's enemyPower array, which will be passed to entities
        game.data.goblinPower = game.levelData.enemyPower[0];
        game.data.berserkerPower = game.levelData.enemyPower[1];
        game.data.impPower = game.levelData.enemyPower[2];

        //Load the map
        me.levelDirector.loadLevel("map01");
        me.game.goblinSettings.tickDelay = 0;
        me.game.berserkSettings.tickDelay = 0;
        me.game.impSettings.tickDelay = 0;

        //Spawn first wave. Check this when enemies die.
        this.checkEnemyStrength();

        // Add our HUD to the game world, add it last so that this is on top of the rest.
        // Can also be forced by specifying a "Infinity" z value to the addChild function.
        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD);
        //this.level = new game.LevelMenu.Container({width: 640, height:360});
        //me.game.world.addChild(this.level);
      
    },


    /**
     * Function to check current enemy strength
     */
    checkEnemyStrength: function() {
        //Check if we need to spawn another wave yet
        if(game.data.enemyStrength < (3+game.data.wave) && game.data.wave < game.levelData.numberWaves)
        {
            this.spawnNewWave(game.data.wave);        //If it's not the last level and the enemies are weak, spawn a new wave
            game.data.wave += 1;                      //Increment wave counter
            //console.log("Wave", game.data.wave, "spawning.");
            //console.log("Gold:",game.data.gold);
            //console.log("Player Lives Remaining:",game.data.playerLives);
        }
        //Final wave logic
        else if (game.data.enemyStrength == 0)
        {
            //console.log("Level", game.data.level, "final enemy destroyed!");
            //console.log("Player Lives Remaining:", game.data.playerLives);
            //console.log("Final Gold:", game.data.gold);
        }
    },


    /**
     * Function to spawn a new wave for the current level
     */
    spawnNewWave: function(nextWave) {
        //Add wave bonus gold (except for first wave)
        if(nextWave>0)
            game.data.gold += game.data.bonus_gold;

        //Add strength for next wave
        game.data.enemyStrength += game.levelData.waveStrength[nextWave];
        
        //Reset tick delay
        me.game.goblinSettings.tickDelay = me.game.berserkSettings.tickDelay = me.game.impSettings.tickDelay = game.levelData.waveDelay;
        
        //Populate New Enemies
        for(i = 0; i < game.levelData.waveInfo[nextWave][0]; i++)
        {
            me.game.world.addChild(me.pool.pull("GoblinEntity"));
            me.game.goblinSettings.tickDelay += game.levelData.waveInfo[nextWave][1];
        }
        for(i = 0; i < game.levelData.waveInfo[nextWave][2]; i++)
        {
            me.game.world.addChild(me.pool.pull("BerserkEntity"));
            me.game.berserkSettings.tickDelay += game.levelData.waveInfo[nextWave][3];
        }
        for(i = 0; i < game.levelData.waveInfo[nextWave][4];i++)
        {
            me.game.world.addChild(me.pool.pull("ImpEntity"));
            me.game.impSettings.tickDelay += game.levelData.waveInfo[nextWave][5];
        }
    },


    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        // remove the HUD from the game world
        me.game.world.removeChild(this.HUD);
        me.game.goblinSettings = undefined;
        me.game.berserkSettings = undefined;
        me.game.impSettings = undefined;
        me.audio.stopTrack();

    }
});
