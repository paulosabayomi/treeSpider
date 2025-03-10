import icons from "./icons";
import TSElement from "./ts-element";
import { TTreeType } from "../types/utils";

class UITools {
    private root_ui_element: HTMLElement | undefined = undefined;
    private zoomInOut: Function = () => null;
    private resetZoom: Function = () => null;
    private animate_chat: Function = () => null;
    public tree_type: TTreeType | undefined = undefined;
    private animatable_trees = ['goldenRod', 'radialSpiderLeg']

    constructor ({root_ui_element, zoomInOut, resetZoom, animate_chat}: 
        {root_ui_element: HTMLElement, zoomInOut: Function, resetZoom: Function, animate_chat: Function}) {
        this.root_ui_element = root_ui_element;        
        this.zoomInOut = zoomInOut;
        this.resetZoom = resetZoom;
        this.animate_chat = animate_chat;
        setTimeout(() => {
            this.make_tools();            
        }, 0);
    }

    private make_tools() {
        const toolWrapperEl = new TSElement();
        toolWrapperEl.className = "tools-container";
        this.root_ui_element?.appendChild(toolWrapperEl);

        const zoomInIcon = new TSElement();
        zoomInIcon.className = "tool-item";
        zoomInIcon.innerHTML = icons.zoomIn;
        zoomInIcon.title = "Zoom in";
        zoomInIcon.onclick = (e) =>  this.zoomInOut();
        
        const zoomOutIcon = new TSElement();
        zoomOutIcon.className = "tool-item";
        zoomOutIcon.innerHTML = icons.zoomOut;
        zoomOutIcon.title = "Zoom out";
        zoomOutIcon.onclick = (e) =>  this.zoomInOut('out');

        const zoomResetIcon = new TSElement();
        zoomResetIcon.className = "tool-item";
        zoomResetIcon.innerHTML = icons.resetZoom;
        zoomResetIcon.title = "Reset zoom & position";
        zoomResetIcon.onclick = (e) =>  this.resetZoom();

        const rotateIcon = new TSElement();
        rotateIcon.className = "tool-item";
        rotateIcon.innerHTML = icons.rotate;
        rotateIcon.title = "Start/Stop Clockwise Rotation";

        const rotateAnticlockwiseIcon = new TSElement();
        rotateAnticlockwiseIcon.className = "tool-item";
        rotateAnticlockwiseIcon.innerHTML = icons.rotate_anticlockwise;
        rotateAnticlockwiseIcon.title = "Start/Stop Anticlockwise Rotation";

        const rotateOnceIcon = new TSElement();
        rotateOnceIcon.className = "tool-item";
        rotateOnceIcon.innerHTML = icons.rotate_once;
        rotateOnceIcon.title = "Rotate Clockwise Once";

        const rotateOnceAnticlockwiseIcon = new TSElement();
        rotateOnceAnticlockwiseIcon.className = "tool-item";
        rotateOnceAnticlockwiseIcon.innerHTML = icons.rotate_once_anti_clockwise;
        rotateOnceAnticlockwiseIcon.title = "Rotate Anticlockwise Once";

        toolWrapperEl.append(zoomInIcon);
        toolWrapperEl.append(zoomOutIcon);
        toolWrapperEl.append(zoomResetIcon);

        if (this.animatable_trees.includes(this.tree_type as string)) {
            toolWrapperEl.append(rotateIcon);
            toolWrapperEl.append(rotateAnticlockwiseIcon);
            toolWrapperEl.append(rotateOnceIcon);
            toolWrapperEl.append(rotateOnceAnticlockwiseIcon);

            rotateIcon.onclick = (e) =>  this.animate_chat();
            rotateAnticlockwiseIcon.onclick = (e) =>  this.animate_chat(false, true);
            rotateOnceIcon.onclick = (e) =>  this.animate_chat(true);
            rotateOnceAnticlockwiseIcon.onclick = (e) =>  this.animate_chat(true, true);
        }
    }
    
}

export default UITools;