import {StateTableRow, StateTable} from '../ai/behaviour/state';
import Slime from "./slime";
import Player from "./player";
import cyberpunkConfigJson from "../../assets/animations/cyberpunk.json";
import slimeConfigJson from "../../assets/animations/slime.json";
import mineConfigJson from '../../assets/animations/mine.json';
import AnimationLoader from "../utils/animation-loader";

import Mine from "./mine";
import SmartSlime from './minerScene/smartSlime';
import NPC from "../characters/npc";
import SlimeWithStates from './slime_with_states';
import SlimeStates from '../ai/behaviour/slime_states';

import { Bullets, PlayerWithGun } from './player_with_gun';
import UserControlled from '../ai/behaviour/user_controlled';
import { Spells, PlayerWithMagic } from './player_with_magic';
import NpcWithStates from './npc_with_states';
import NpcStates from '../ai/behaviour/npc_states';

export default class CharacterFactory {
    constructor(scene) {
        this.scene = scene;

        this.cyberSpritesheets =  ['aurora', 'blue', 'yellow', 'green', 'punk'];
        this.slimeSpriteSheet = 'slime';

        this.mineSpriteSheet = 'mine';
        const slimeStateTable = new StateTable(this);
        slimeStateTable.addState(new StateTableRow('searching', this.foundTarget, 'jumping'));
        slimeStateTable.addState(new StateTableRow('jumping', this.lostTarget, 'searching'));

        let animationLibrary =  new Map();
        this.cyberSpritesheets.forEach(
            function (element) {
                animationLibrary.set(element, new AnimationLoader(scene,
                    element,
                    cyberpunkConfigJson,
                    element).createAnimations());
            }
        );
        animationLibrary
            .set(this.mineSpriteSheet, new AnimationLoader(scene, this.mineSpriteSheet, mineConfigJson, this.mineSpriteSheet)
            .createAnimations());
        animationLibrary
            .set(this.slimeSpriteSheet,
            new AnimationLoader(scene, this.slimeSpriteSheet, slimeConfigJson, this.slimeSpriteSheet)
                .createAnimations());
        this.animationLibrary = animationLibrary;
    }

    buildCharacter(spriteSheetName, x, y, params = {}) {
        switch (spriteSheetName) {
            case 'green':
            case 'punk':
            case 'aurora':
            case 'blue':
            case 'yellow':
                if (params.player)
                    return this.buildPlayerCharacter(spriteSheetName, x, y, params);
                else {
                        return this.buildNPCCharacter(spriteSheetName, x, y, params);
                }
            case "slime":
                return this.buildSlime(x, y, params);
            case "mine":
                return this.buildMine(x, y, params);
        }
    }


    buildNPCCharacter(spriteSheetName, x, y, params) {
        let character;
        if (params.useStates) {
            character = new NpcWithStates(this.scene, x, y, spriteSheetName, 'gun', NpcStates.ChasingSlime);
            params.addConditions(character);
            params.createStateTable(character);
            params.initSteerings(character);
        } else {
            character = new NPC(this.scene, x, y, spriteSheetName, 2, params.Steering);
        }
        character.animationSets = this.animationLibrary.get(spriteSheetName);
        return character;
    }

    addBulletsBehaviour(character, BulletsClass) {
        this.scene.bullets = new BulletsClass(this.scene);
        if (this.scene.groundLayer) {
            this.scene.physics.add.collider(this.scene.bullets, this.scene.groundLayer, (bullet) => {
                bullet.setVisible(false);
                bullet.setActive(false);
            });
        }
        if (this.scene.otherLayer) {
            this.scene.physics.add.collider(this.scene.bullets, this.scene.otherLayer, (bullet) => {
                bullet.setVisible(false);
                bullet.setActive(false);
            });
        }
        const context = this;
        this.scene.input.on('pointerdown', (pointer) => {
            const {x, y} = character.bulletStartingPoint
            character.subtractHP(1);
            character.lastTimeFired = (new Date()).getTime();

            const vx = pointer.x + context.scene.cameras.main.scrollX - x;
            const vy = pointer.y + context.scene.cameras.main.scrollY - y;

            const BULLET_SPEED = 400
            const mult = BULLET_SPEED / Math.sqrt(vx*vx + vy*vy)            
            this.scene.bullets.fireBullet(x, y, vx * mult, vy * mult, character);
        });
    }

    buildPlayerCharacter(spriteSheetName, x, y, params = {}) {
        const maxSpeed = 100;
        let character;
        if (params.withGun) {
            character = new PlayerWithGun(this.scene, x, y, spriteSheetName, 'gun');
            const wasdCursorKeys = this.scene.input.keyboard.addKeys({
                up:Phaser.Input.Keyboard.KeyCodes.W,
                down:Phaser.Input.Keyboard.KeyCodes.S,
                left:Phaser.Input.Keyboard.KeyCodes.A,
                right:Phaser.Input.Keyboard.KeyCodes.D
            });
            character.addBehaviour(new UserControlled(150, wasdCursorKeys));
            this.addBulletsBehaviour(character, Bullets);
        } else if (params.withMagic) {
            character = new PlayerWithMagic(this.scene, x, y, spriteSheetName);
            const wasdCursorKeys = this.scene.input.keyboard.addKeys({
                up:Phaser.Input.Keyboard.KeyCodes.W,
                down:Phaser.Input.Keyboard.KeyCodes.S,
                left:Phaser.Input.Keyboard.KeyCodes.A,
                right:Phaser.Input.Keyboard.KeyCodes.D
            });
            character.addBehaviour(new UserControlled(150, wasdCursorKeys));
            this.addBulletsBehaviour(character, Spells);
        } else {
            character = new Player(this.scene, x, y, spriteSheetName, 2, params);
            character.setCollideWorldBounds(true);
            character.cursors = this.scene.input.keyboard.createCursorKeys();
        }
        character.maxSpeed = maxSpeed;
        
        character.animationSets = this.animationLibrary.get(spriteSheetName);
        //todo: not here
        character.footstepsMusic = this.scene.sound.add('footsteps', {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
        //todo uncomment at your won risk - these footsteps will get you insane
        // character.footstepsMusic.play();


        return character;

    }

    buildCyberpunkCharacter(spriteSheetName, x, y, params) {
        return this.scene.physics.add.sprite(x, y, spriteSheetName, 2);

        //todo: add mixin
    }

    buildSlime(x, y, params) {

        const slimeType = params.slimeType;
        let slime;
        if (params.useSteering) {
            slime = new SmartSlime(this.scene, x, y, this.slimeSpriteSheet, 9*slimeType);
        } else if (params.useStates) {
            slime = new SlimeWithStates(this.scene, x, y, this.slimeSpriteSheet, 9*slimeType, SlimeStates.Searching);
            params.addSlimesConditions(slime);
            params.createStateTable(slime);
            params.initSteerings(slime);
        } else {
            slime = new Slime(this.scene, x, y, this.slimeSpriteSheet, 9 * slimeType);
        }

        slime.animations = this.animationLibrary
                .get(this.slimeSpriteSheet)
                .get(this.slimeNumberToName(slimeType));
        slime.setCollideWorldBounds(true);
        slime.speed = 40;
        return slime;
    }

    slimeNumberToName(n)
    {
        switch (n) {
            case 0: return 'Blue';
            case 1: return 'Green';
            case 2: return 'Orange';
            case 3: return 'Pink';
            case 4: return 'Violet';
        }

    }
    
    buildMine(x, y, params) {
        let mine = new Mine(this.scene, x, y, this.mineSpriteSheet, 0);
        mine.animations = this.animationLibrary.get(this.mineSpriteSheet).get("Mine");
    }
}
