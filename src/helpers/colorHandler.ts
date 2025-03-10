import * as d3 from "d3";
import { IChartHead } from "../types/MainTypes";
import { TColorPallet } from "../types/utils";
import { TColorSet } from "../types/utils";


class ColorHandler {
    private tree_data: IChartHead[] = [];
    private color_range: string[] = ['#b31212', '#b34712', '#b38d12', '#9ab312', '#2fb312', '#12b362', '#12b3a8', '#1278b3', '#1712b3', '#5712b3', '#8d12b3', '#b3128d', '#b3124a', '#b31212'];
    private interpolated_color: (t: number) => string = (t) => '';
    pallet = {
        h: 10,
        s: 0.5,
        l: 0.5,
        darker: 0.8,
        brighter: 0.8,
        bright100: 0.5,
        dark100: 0.5,
        gray: 50,
        gray85: 85
    }

    constructor ({tree_data, color_range, pallet}: {tree_data: IChartHead[]; color_range?: string[]; pallet?: TColorPallet;}) {
        this.tree_data = tree_data;
        (color_range !== undefined && color_range.length > 0) && (this.color_range = color_range as string[]);
        
        pallet != undefined && (this.pallet = pallet);
        this.interpolateColor();
    }

    public getColor (index: number): TColorSet {
        const color_percentage = this.get_color_percentage(index);
        const color = this.interpolated_color(color_percentage);
        const conv_color = d3.color(color);
        
        const to_hsl = d3.hsl(conv_color as d3.RGBColor);
        to_hsl.h += this.pallet.h;
        to_hsl.s += this.pallet.s;

        const hsl_bright = d3.hsl(conv_color as d3.RGBColor)
        hsl_bright.l += this.pallet.l;

        const opac_gray80 = d3.gray(this.pallet.gray85)

        const colorSet: TColorSet = {
            color: color,
            darker: conv_color?.darker(this.pallet.darker).toString() as string,
            brighter: conv_color?.brighter(this.pallet.brighter).toString() as string,
            bright100: to_hsl.brighter(this.pallet.bright100).toString() as string,
            dark100: to_hsl.darker(this.pallet.dark100).toString(),
            bright500: hsl_bright.toString() as string,
            gray: d3.gray(this.pallet.gray).toString(),
            gray85: opac_gray80.toString(),
        }
        return colorSet;
    }

    public get_app_gray () {
        return d3.gray(this.pallet.gray).toString();
    }

    private get_color_percentage (index: number) {
        return (index / this.tree_data.length);
    }

    private interpolateColor () {
        this.interpolated_color = d3.interpolateRgbBasis(this.color_range);
    }
}

export default ColorHandler;