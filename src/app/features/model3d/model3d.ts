import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import '@google/model-viewer';
import { ChatService } from '../../shared/Components/ai-chatbot/AI_Service/chat-service';

@Component({
  selector: 'app-model3d',
  imports: [CommonModule, FormsModule],
  templateUrl: './model3d.html',
  styleUrl: './model3d.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Model3d {
 
  // Design properties
  designPrompt: string = '';
  currentStyle: string = 'realistic';
  currentColor: string = '#2c3e50';
  currentSize: string = 'medium';
  currentPosition: string = 'center';
  isGenerating: boolean = false;
  generatedImageUrl: string = '';
  showPreview: boolean = false;

  // mockup preview URL
  mockupPreviewUrl: string = '';

  // Optional base mockup image (placeholder - will use fallback if not found)
  mockupBaseUrl: string = 'assets/images/tshirt-mockup.png';

  // Available design styles
  designStyles = [
    { id: 'realistic', name: 'Realistic', icon: '📷' },
    { id: 'cartoon', name: 'Cartoon', icon: '🎨' },
    { id: 'abstract', name: 'Abstract', icon: '🎭' },
    { id: 'minimalist', name: 'Minimalist', icon: '⚪' },
    { id: 'vintage', name: 'Vintage', icon: '📜' },
    { id: 'graffiti', name: 'Graffiti', icon: '🎪' }
  ];

  // Base colors
  baseColors = [
    { color: '#2c3e50', name: 'Dark Blue' },
    { color: '#e74c3c', name: 'Red' },
    { color: '#3498db', name: 'Blue' },
    { color: '#2ecc71', name: 'Green' },
    { color: '#9b59b6', name: 'Purple' },
    { color: '#f39c12', name: 'Orange' },
    { color: '#1abc9c', name: 'Turquoise' },
    { color: '#34495e', name: 'Gray' }
  ];

  // Design sizes
  designSizes = [
    { id: 'small', name: 'Small' },
    { id: 'medium', name: 'Medium' },
    { id: 'large', name: 'Large' }
  ];

  // Design positions
  designPositions = [
    { id: 'center', name: 'Center' },
    { id: 'left', name: 'Left' },
    { id: 'right', name: 'Right' }
  ];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    console.log('3D Design Component loaded');
  }

  // Change style
  selectStyle(style: string) {
    this.currentStyle = style;
    console.log('Style selected:', style);
  }

  // Change color
  selectColor(color: string) {
    this.currentColor = color;
    this.updateModelColor(color);
    console.log('Color selected:', color);
  }

  // Change size
  selectSize(size: string) {
    this.currentSize = size;
    console.log('Size selected:', size);
  }

  // Change position
  selectPosition(position: string) {
    this.currentPosition = position;
    console.log('Position selected:', position);
  }

  // Update model color
  private updateModelColor(color: string) {
    // Here you can add code to change the 3D model color
    const modelViewer = document.querySelector('model-viewer');
    if (modelViewer) {
      // Update model materials here
      console.log('Updating model color to:', color);
    }
  }

  // Generate design using the same service used by image-generation feature
  async generateDesign() {
    if (!this.designPrompt.trim()) {
      alert('Please enter a design description');
      return;
    }

    this.isGenerating = true;
    this.showPreview = false;
    this.mockupPreviewUrl = '';
    this.generatedImageUrl = '';

    try {
      const { width, height } = this.getDimensionsFromSize(this.currentSize);

      // Use ChatService to generate an image URL based on prompt and size
      const url = this.chatService.generateImageWithParams(
        `${this.designPrompt} | style: ${this.currentStyle}`,
        width,
        height
      );

      console.log('Generated image URL:', url ? url.substring(0, 100) + '...' : 'null');
      
      if (!url || url.trim() === '') {
        throw new Error('Failed to generate image URL');
      }

      // Test if the image URL can be loaded before setting it
      console.log('Testing image URL accessibility...');
      try {
        await this.loadImageSafe(url);
        console.log('Image URL test successful!');
      } catch (testError) {
        console.error('Image URL test failed:', testError);
        throw new Error('Generated image URL is not accessible. The image service might be temporarily unavailable.');
      }

      this.generatedImageUrl = url;
      this.showPreview = true;
      
      console.log('Design generated successfully!');
    } catch (error) {
      console.error('Error generating design:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error generating design: ${errorMessage}. Please try again.`);
    } finally {
      this.isGenerating = false;
    }
  }

  // Map size ID to pixel dimensions
  private getDimensionsFromSize(sizeId: string): { width: number; height: number } {
    switch (sizeId) {
      case 'small':
        return { width: 384, height: 384 };
      case 'large':
        return { width: 1024, height: 1024 };
      case 'medium':
      default:
        return { width: 512, height: 512 };
    }
  }

  // Place generated image onto a T-shirt mockup via canvas composition
  async placeOnMockup() {
    if (!this.generatedImageUrl) {
      alert('Please generate a design first');
      return;
    }

    try {
      this.isGenerating = true;
      console.log('Starting T-shirt mockup creation...');
      
      // Create high-quality canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1400;
      const ctx = canvas.getContext('2d')!;
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Enhanced canvas settings for better quality
      ctx.imageSmoothingEnabled = true;
      if (ctx.imageSmoothingQuality) {
        ctx.imageSmoothingQuality = 'high';
      }

      // Always create the fallback T-shirt first (more reliable)
      console.log('Drawing T-shirt base...');
      this.drawFallbackTshirt(ctx, canvas.width, canvas.height);

      // Load and draw the generated design
      console.log('Loading generated design image...');
      const designImg = await this.loadImageSafe(this.generatedImageUrl);
      console.log('Design image loaded successfully, dimensions:', designImg.width, 'x', designImg.height);
      
      // Calculate placement rectangle based on size and position
      const placement = this.calculateDesignPlacement(canvas.width, canvas.height);
      console.log('Design placement calculated:', placement);
      
      // Apply shadow and glow effects
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 8;
      
      // Draw the design with proper scaling and positioning
      ctx.drawImage(
        designImg, 
        placement.x, 
        placement.y, 
        placement.width, 
        placement.height
      );
      
      console.log('Design drawn on T-shirt at:', placement);
      ctx.restore();
      
      // Add fabric texture effect (simplified to avoid errors)
      try {
        this.addFabricTexture(ctx, placement);
        console.log('Fabric texture applied');
      } catch (textureError) {
        console.log('Fabric texture skipped due to error:', textureError);
      }
      
      // Convert to high-quality image
      this.mockupPreviewUrl = canvas.toDataURL('image/png', 1.0);
      
      console.log('✅ T-shirt mockup created successfully!');
      console.log('Mockup preview URL length:', this.mockupPreviewUrl.length);
      
      // Force Angular to detect changes
      setTimeout(() => {
        if (this.mockupPreviewUrl) {
          console.log('✨ Mockup is ready and should be visible!');
        }
      }, 100);
      
    } catch (error) {
      console.error('Error creating T-shirt mockup:', error);
      alert(`Failed to create T-shirt mockup: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      this.isGenerating = false;
    }
  }

  // Draw a professional fallback T-shirt when base image is not available
  private drawFallbackTshirt(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Create gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#f8f9fa');
    bgGradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw T-shirt outline
    ctx.fillStyle = this.currentColor;
    
    // T-shirt body using basic shapes since roundRect might not be available
    const centerX = width / 2;
    const centerY = height / 2;
    const shirtWidth = width * 0.6;
    const shirtHeight = height * 0.7;
    
    // Main body rectangle
    ctx.fillRect(
      centerX - shirtWidth / 2,
      centerY - shirtHeight / 2 + 50,
      shirtWidth,
      shirtHeight
    );
    
    // Sleeves
    const sleeveWidth = shirtWidth * 0.3;
    const sleeveHeight = shirtHeight * 0.4;
    
    // Left sleeve
    ctx.fillRect(
      centerX - shirtWidth / 2 - sleeveWidth * 0.7,
      centerY - shirtHeight / 2 + 50,
      sleeveWidth,
      sleeveHeight
    );
    
    // Right sleeve
    ctx.fillRect(
      centerX + shirtWidth / 2 - sleeveWidth * 0.3,
      centerY - shirtHeight / 2 + 50,
      sleeveWidth,
      sleeveHeight
    );
    
    // Add neckline
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY - shirtHeight / 2 + 50,
      shirtWidth * 0.15,
      0,
      Math.PI,
      false
    );
    ctx.fill();
    
    // Add subtle shadow for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(
      centerX - shirtWidth / 2 + 10,
      centerY - shirtHeight / 2 + 60,
      shirtWidth - 10,
      shirtHeight - 10
    );
  }

  // Enhanced design placement calculation
  private calculateDesignPlacement(canvasWidth: number, canvasHeight: number): 
    { x: number; y: number; width: number; height: number } {
    
    // Base dimensions based on size selection
    let sizeMultiplier: number;
    switch (this.currentSize) {
      case 'small': sizeMultiplier = 0.25; break;
      case 'large': sizeMultiplier = 0.45; break;
      case 'medium':
      default: sizeMultiplier = 0.35; break;
    }
    
    const designWidth = canvasWidth * sizeMultiplier;
    const designHeight = designWidth; // Keep square aspect ratio
    
    // Base position (chest area)
    let baseX = (canvasWidth - designWidth) / 2;
    let baseY = canvasHeight * 0.35;
    
    // Adjust position based on selection
    switch (this.currentPosition) {
      case 'left':
        baseX = canvasWidth * 0.3 - designWidth / 2;
        break;
      case 'right':
        baseX = canvasWidth * 0.7 - designWidth / 2;
        break;
      case 'center':
      default:
        baseX = (canvasWidth - designWidth) / 2;
        break;
    }
    
    return {
      x: baseX,
      y: baseY,
      width: designWidth,
      height: designHeight
    };
  }

  // Add fabric texture effect to make design look more realistic
  private addFabricTexture(ctx: CanvasRenderingContext2D, placement: any) {
    try {
      ctx.save();
      
      // Create subtle fabric texture overlay using a simple pattern
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.05;
      
      // Create a simple texture pattern
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = 4;
      patternCanvas.height = 4;
      const patternCtx = patternCanvas.getContext('2d')!;
      
      // Draw a simple texture pattern
      patternCtx.fillStyle = '#000';
      patternCtx.fillRect(0, 0, 2, 2);
      patternCtx.fillRect(2, 2, 2, 2);
      
      const pattern = ctx.createPattern(patternCanvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(placement.x, placement.y, placement.width, placement.height);
      }
      
      ctx.restore();
    } catch (error) {
      console.log('Fabric texture could not be applied:', error);
      // Continue without texture - it's not critical
    }
  }



  private loadImageSafe(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (!src || src.trim() === '') {
        reject(new Error('Image source is empty or invalid'));
        return;
      }
      
      console.log('Attempting to load image:', src.substring(0, 100) + '...');
      
      const img = new Image();
      
      // Only set crossOrigin for external URLs
      if (src.startsWith('http://') || src.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onload = () => {
        console.log('Image loaded successfully:', img.width + 'x' + img.height);
        resolve(img);
      };
      
      img.onerror = (e) => {
        console.error('Failed to load image:', src.substring(0, 100) + '...', e);
        reject(new Error(`Failed to load image. The image URL might be invalid or inaccessible.`));
      };
      
      // Set timeout for image loading
      setTimeout(() => {
        if (!img.complete) {
          reject(new Error('Image loading timeout after 10 seconds'));
        }
      }, 10000);
      
      img.src = src;
    });
  }

  // Adjust color brightness
  private adjustBrightness(color: string, amount: number): string {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;

    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = (num >> 8 & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;

    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;

    return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
  }

  // Apply design to the 3D model via model-viewer scene graph (best effort)
  async applyDesignToModel() {
    if (!this.generatedImageUrl || this.generatedImageUrl.trim() === '') {
      alert('Please generate a design first');
      return;
    }

    console.log('Attempting to apply design to 3D model...');
    console.log('Design URL:', this.generatedImageUrl.substring(0, 100) + '...');

    const modelViewer = document.querySelector('model-viewer') as any;
    if (!modelViewer) {
      console.error('Model viewer element not found in DOM');
      alert('3D Model viewer not found. Using T-shirt mockup instead.');
      await this.placeOnMockup();
      return;
    }

    try {
      // Show loading state
      this.isGenerating = true;
      
      // Wait for model to be fully loaded
      await modelViewer.updateComplete;
      
      // If model isn't loaded yet, wait for it
      if (!modelViewer.model) {
        console.log('Waiting for model to load...');
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Model load timeout'));
          }, 10000);
          
          const onLoad = () => { 
            clearTimeout(timeout);
            cleanup(); 
            resolve(); 
          };
          const onError = () => { 
            clearTimeout(timeout);
            cleanup(); 
            reject(new Error('Model failed to load')); 
          };
          const cleanup = () => {
            modelViewer.removeEventListener('load', onLoad);
            modelViewer.removeEventListener('error', onError);
          };
          
          modelViewer.addEventListener('load', onLoad, { once: true });
          modelViewer.addEventListener('error', onError, { once: true });
        });
      }

      const model = modelViewer.model;
      if (!model || !model.materials) {
        throw new Error('Model or materials not available');
      }

      // Load the generated design image
      console.log('Loading design image for 3D model...');
      let imgEl: HTMLImageElement;
      try {
        imgEl = await this.loadImageSafe(this.generatedImageUrl);
      } catch (imageError) {
        console.error('Failed to load design image:', imageError);
        throw new Error(`Cannot load design image: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
      }
      
      // Create texture from the image
      const texture = await modelViewer.createTexture(imgEl);
      
      if (!texture) {
        throw new Error('Failed to create texture from image');
      }

      const materials = model.materials;
      console.log('Available materials:', materials.map((m: any, i: number) => `${i}: ${m.name || 'Unnamed'}`));

      // Try to find the main fabric material for the hoodie/shirt
      const fabricMaterialNames = ['hoodie', 'body', 'fabric', 'torso', 'shirt', 'sweater', 'cloth', 'main', 'base'];
      let targetMaterial = materials.find((m: any) => {
        const name = (m.name || '').toLowerCase();
        return fabricMaterialNames.some(keyword => name.includes(keyword));
      });

      // If no specific material found, use the first one
      if (!targetMaterial && materials.length > 0) {
        targetMaterial = materials[0];
      }

      if (!targetMaterial) {
        throw new Error('No suitable material found to apply design');
      }

      // Apply the texture to the material
      if (targetMaterial.pbrMetallicRoughness) {
        await targetMaterial.pbrMetallicRoughness.setBaseColorTexture(texture);
        console.log('Applied design texture to material:', targetMaterial.name || 'Unnamed');
        
        // Optional: adjust material properties for better appearance
        if (targetMaterial.pbrMetallicRoughness.setMetallicFactor) {
          targetMaterial.pbrMetallicRoughness.setMetallicFactor(0.1); // Less metallic
        }
        if (targetMaterial.pbrMetallicRoughness.setRoughnessFactor) {
          targetMaterial.pbrMetallicRoughness.setRoughnessFactor(0.8); // More fabric-like
        }
        
        alert('🎉 Design successfully applied to the 3D model!');
      } else {
        throw new Error('Material does not support PBR textures');
      }
      
    } catch (error) {
      console.error('Failed to apply design to 3D model:', error);
      
      // Always create the T-shirt mockup as fallback
      console.log('Creating T-shirt mockup as fallback...');
      await this.placeOnMockup();
      
      // Don't show error alert since we're providing the mockup instead
      console.log('✅ T-shirt mockup created as alternative to 3D model application');
    } finally {
      this.isGenerating = false;
    }
  }

  // Add effects
  addGlowEffect() {
    console.log('Adding glow effect');
    // Apply glow effect
  }

  addShadowEffect() {
    console.log('Adding shadow effect');
    // Apply shadow effect
  }

  addMetallicEffect() {
    console.log('Adding metallic effect');
    // Apply metallic effect
  }
}
