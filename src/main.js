"use strict";
const OUTPUT_ENABLED = false;
//let t = 0;
//for (let i=0; i<1000; i++) {
let i=0;
const image = new Image();
setInterval(()=>{
  //if (i>5000) return;
  const t=(i)/400000;
  const frame = new Image();


  const BASE_VERTEX_SHADER = `
  attribute vec2 position;
  varying vec2 texCoords;

  void main() {
    texCoords = (position + 1.0) / 2.0;
    texCoords.y = 1.0 - texCoords.y;
    gl_Position = vec4(position, 0, 1.0);
  }
  `;
  const BASE_FRAGMENT_SHADER = `
  precision highp float;
  #define PI ${Math.PI}
  #define TAU ${2.0*Math.PI}
  #define T ${t.toFixed(20)}
  #define SCALE ${((6**(1-t))*0.16*(0.5+0.5*Math.cos(t*2.0*Math.PI/3.12321))).toFixed(20)}
  #define TMOD_SCALE ${(1.2*(0.5+0.49999*Math.cos(1000*t*2.0*Math.PI/3.12321))).toFixed(20)}
  #define K ${(5+3*Math.cos(t*2.0*Math.PI*4)).toFixed(20)}
  #define GAIN ${(1.5-1*Math.sin(t*2.0*Math.PI/0.11)).toFixed(3)}
  #define SMOOTH ${(10-10*Math.cos(t*2.0*Math.PI/3.12321)).toFixed(3)}
  #define BURNSAMPLES ${(10+4*Math.cos(t*2.0*Math.PI/3.12321)).toFixed(3)}
  #define BURNDELAY ${(1.01+1*Math.cos(t*2.0*Math.PI/3.12321)).toFixed(3)}
  varying vec2 texCoords;
  uniform sampler2D textureSampler;

  vec2 point(float n, float d, float r) {
    return vec2(0.5, 0.5)+vec2(r * cos(2.0*3.14159*n/d), r * sin(2.0*3.14159*n/d));
  }

  vec3 f(vec3 colorIn, vec2 texCoords, float t) {
    float scale = SCALE * exp2(1.0+1.0*cos(t*TAU*10.0));
    t += 2.0*(0.25*cos(1.0/scale*(texCoords.y+texCoords.x/8.0)*200.1*TAU)+0.5*sin(scale*texCoords.y*100.1*TAU)+sin(scale*texCoords.y*50.1*TAU)+0.125*sin(SCALE*texCoords.y*25.1*TAU))/5.0;
    vec3 color;
    color =  vec3(sin((t/PI+0.5/3.0)*TAU), sin((t/PI+1.5/3.0)*TAU), sin((t/PI+2.5/3.0)*TAU));
    return colorIn;//step(color, colorIn);
  }
  vec3 g(vec3 colorIn, vec2 texCoords, float t) {
    float scale = SCALE * exp2(3.0+1.0*cos(t*TAU/40.0));
    vec3 color = vec3(0,0,0);//cos((texCoords.x+texCoords.y)*100.0*TAU*scale), cos((texCoords.x+texCoords.y+1.0/3.0)*100.0*TAU*scale), cos((texCoords.x+texCoords.y+2.0/3.0)*100.0*TAU*scale));
    float k = 6.0;
    for (float i=0.0;(i<K); i++) {
      for (int j=0;j<3; j++) {
        float n = float(j)*TAU/3.0+scale*distance(texCoords, point(i+t/100.0,K,10.0));
        color[j] += 0.25 * cos(n) + 0.5 * cos(2.0*n) + 1.0 * cos(3.0*n);
      }
    }
    return color;
  }
  vec3 h(vec3 colorIn, vec2 texCoords, float t) {
        t -= (1.0/BURNDELAY)*(0.01*cos((texCoords.x*texCoords.y)*40.1*TAU*TMOD_SCALE)+0.5*cos(texCoords.y*50.1*TAU*TMOD_SCALE)+0.125*cos(texCoords.y*2001.0*TAU*TMOD_SCALE))/5.0;
    for (float i=BURNSAMPLES; i>0.0; i--) {
      colorIn = mix(colorIn, g(colorIn, texCoords, t - i*BURNDELAY), GAIN);
    }
    return colorIn;
  }

  void main() {
    float k;
    k = 6.0 ;//+ log( T );
    vec4 texColor = texture2D(textureSampler, texCoords);
    vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
    color.rgb = h(color.rgb, texCoords, T);
    gl_FragColor = color;
  }
  `;

  image.crossOrigin = "Anonymous";
  const idNumber = (i+1).toString().padStart(4, "0");
  //image.src = `/img${idNumber}.png`
  image.src = "https://images.unsplash.com/photo-1628424031741-99dfb4d19343?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTYzMTA0MTIyOQ&ixlib=rb-1.2.1&q=80&w=800";
  image.onload = () => {
    console.log(i, t);
    // Get our canvas
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl");
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    // Create our vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, BASE_VERTEX_SHADER);
    gl.compileShader(vertexShader);
    // Create our fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, BASE_FRAGMENT_SHADER);
    gl.compileShader(fragmentShader);
    // Create our program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    // Enable the program
    gl.useProgram(program);
    // Bind VERTICES as the active array buffer.
    const VERTICES = new Float32Array([-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);
    // Set and enable our array buffer as the program's "position" variable
    const positionLocation = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);
    // Create a texture
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // Draw our 6 VERTICES as 2 triangles
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    // frame.src = canvas.toDataURL();
    // document.body.appendChild(frame);
    if (OUTPUT_ENABLED) {
      const a = document.createElement("a");
      a.setAttribute("textcontent", `out${idNumber}.png`);
      a.setAttribute("href", canvas.toDataURL());
      a.setAttribute("download", `out${idNumber}.png`);
      a.click();
    }
    i++;
  };
}, 1000/60);