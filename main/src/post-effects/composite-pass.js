/* global THREE, Kontrol */

import {smoothstep} from 'interpolation'

const TRANSITION_DURATION = 1500

export default class CompositePass extends THREE.ShaderPass {
	constructor() {
		super({
			uniforms: {
				resolution: {type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
				exclusionColor: {type: 'c', value: new THREE.Color(0x000000)},
				tDiffuse: {type: 't', value: null}
			},
			vertexShader: require('../shaders/basic-transform.vert'),
			fragmentShader: require('../shaders/composite.frag'),
		})
		this.enabled = true

		this.currentExclusionColor = new THREE.Color(0, 0, 0)
		this.targetExclusionColor = new THREE.Color(0, 0, 0)
		this.transitionTime = null

		Kontrol.on('changeExclusionColor', (value) => {
			if (this.transitionTime == null) {
				this.currentExclusionColor.set(this.targetExclusionColor)
			} else {
				this.currentExclusionColor.set(this.uniforms.exclusionColor.value)
			}
			this.targetExclusionColor.set(value)
			this.transitionTime = TRANSITION_DURATION
		})

	}

	update(elapsed) {

		if (this.transitionTime != null) {

			this.transitionTime -= elapsed

			if (this.transitionTime > 0) {
				let t = 1 - (this.transitionTime / TRANSITION_DURATION)
				t = smoothstep(0, 1, t)
				t = smoothstep(0, 1, t)
				this.uniforms.exclusionColor.value.set(this.currentExclusionColor)
				this.uniforms.exclusionColor.value.lerp(this.targetExclusionColor, t)
			} else {
				this.uniforms.exclusionColor.value.set(this.targetExclusionColor)
				this.transitionTime = null
			}
		}
	}
}
