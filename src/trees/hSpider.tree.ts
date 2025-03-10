import { IChartHead } from "../types/MainTypes";
import ChartMainHelper from "../helpers/chart-helper";
import { TTreeClassParams, TTreeMapArr } from "../types/utils";
import TSElement from "../utils/ts-element";
import * as d3 from 'd3'

class HorizontalTreeSpider {
    private chartHelper: ChartMainHelper | undefined;

    private tree_map_arr: Array<TTreeMapArr> = [];

    protected content_wrapper: HTMLElement | null = null;
    protected tsInnerContainer: HTMLElement | null = null;

    public current_scale = 1;

    constructor ({tsInnerContainer, chartHelper}: TTreeClassParams) {
        this.tsInnerContainer = tsInnerContainer;

        this.chartHelper = chartHelper;
        this.chartHelper.handleCollapseChildren = this.handleCollapseChildren.bind(this)

        setTimeout(() => {
            this.organizeUI();
        }, 0);

    }

    private organizeUI () {
        this.content_wrapper = this.chartHelper!.createDynamicEl();
        this.content_wrapper.className = "ts-head-wrapper";
        this.chartHelper!.set_tmp_tree_data()
        this.map_children_data_to_head();
        this.tsInnerContainer!.appendChild(this.content_wrapper);
        this.drawBranchLinkFresh();
        d3.timeout(() => {
            const first_svg_el = (d3.select(`${this.chartHelper!.app_root_unique_selector} .root-svg-el`)!.node() as SVGSVGElement)!.getBoundingClientRect();
            this.chartHelper?.center_elem(first_svg_el, "left")
        }, 0);
    }

    private map_children_data_to_head (parentSVGEl?: any, parentId?: string) {
        const hierarchies = this.chartHelper!.tmp_tree_data.filter(data => data.parentId == parentId);
        const childElContainer = this.chartHelper!.createDynamicEl();
        hierarchies.forEach(head => {
            const head_UI_wrapper = this.chartHelper!.createDynamicEl();
            const head_UI_inner = this.chartHelper!.createDynamicEl();
            const head_UI = this.chartHelper!.makeHead(head as IChartHead, false, {parent: "right", children: "left"});
            head_UI_inner.append(head_UI?.node() as SVGSVGElement)

            head_UI_wrapper.appendChild(head_UI_inner);
            const root_el_cls = parentId == undefined ? " st-root-el" : "";
            head_UI_wrapper.className = "ts-head-node-wrapper st-single-h ts-w-id-" + head.id + root_el_cls;
            childElContainer.appendChild(head_UI_wrapper);
            
            parentSVGEl != undefined && this.tree_map_arr.push({id: head.id, svgNode: parentSVGEl, targetChild: head_UI?.node() as SVGSVGElement, parentId: parentId as string});
            
            if (this.chartHelper?.el_has_children(head.id)) {
                head_UI_wrapper.append(this.map_children_data_to_head(head_UI, head.id) as TSElement);
            }
            
        })
        childElContainer.className = "ts-head-wrapper st-single-h-child-container";
        if (parentSVGEl === undefined) this.content_wrapper?.appendChild(childElContainer);
        return childElContainer;
    }

    private drawBranchLinkFresh () {
        this.chartHelper!.rootWrapperContainer?.querySelectorAll('.linker-line').forEach(el => el.remove());
        this.tree_map_arr.forEach(branch => this.drawBranchLink(branch.id, branch.svgNode, branch.targetChild as SVGSVGElement, branch.parentId));
    }

    private drawBranchLink (id: string, svgNode: any, targetChild: SVGSVGElement, parentId: string) {
        const isParentChildrenHidden = this.tsInnerContainer?.querySelector('.ts-w-id-'+parentId)?.getAttribute('data-ts-head-children-hidden');
        if (isParentChildrenHidden === 'true') return;

        const color_set = this.chartHelper?.color_handler.getColor(id as unknown as number);
        
        const elementBounds = targetChild.getBoundingClientRect();
        const svgSourceNodeBounds = svgNode.node().getBoundingClientRect();

        const lineStartX = (svgSourceNodeBounds.width / this.current_scale);
        const lineStartY = (svgSourceNodeBounds.height / this.current_scale) / 2;

        const lineEndX = ((elementBounds.x) / this.current_scale) - ((svgSourceNodeBounds.x) / this.current_scale) + 0
        const lineEndY = (((elementBounds.top + (elementBounds.height / 2)) / this.current_scale) - ((svgSourceNodeBounds.top) / this.current_scale));


        const curveFactory = this.chartHelper?.tree_link_type != undefined ? this.chartHelper?.tree_link_types[this.chartHelper?.tree_link_type] : d3.curveBumpX
        const link = d3.link(curveFactory);
        
        const data = [
            {source: [lineStartX, lineStartY], target: [lineEndX, lineEndY]},
        ];
        
        svgNode?.append('path')
        .data(data)
        .attr('d', link)
        .attr('fill', 'none')
        .attr('class', 'linker-line')
        .attr('stroke-width', 1)
        .attr('stroke', color_set?.gray)
        .attr('style', 'z-index: -1');
    }

    private handleCollapseChildren (svgNode: any, id: string, clicked_pos: number) {
        const nodeAncestor = svgNode.node()?.parentElement.parentElement;
        const nodeChildrenHidden = nodeAncestor?.getAttribute('data-ts-head-children-hidden')
        const childrenContainer = nodeAncestor?.querySelector("[class*='child-container']");
        
        if (!nodeAncestor?.hasAttribute('data-ts-head-children-hidden') && nodeAncestor.querySelector('.st-single-h-child-container').innerHTML == '') {
            this.chartHelper!.set_tmp_tree_data(id)
            nodeAncestor.querySelector('.st-single-h-child-container').remove()
            const remade_children_obj = this.map_children_data_to_head(svgNode, id);
            nodeAncestor?.appendChild(remade_children_obj);
            nodeAncestor?.setAttribute('data-ts-head-children-hidden', 'false'); 
            this.drawBranchLinkFresh();
        }else if (nodeChildrenHidden == 'true') {
            childrenContainer.style.visibility = ''
            nodeAncestor?.setAttribute('data-ts-head-children-hidden', 'false');            
            this.drawBranchLinkFresh();
        }else{
            childrenContainer.style.visibility = 'hidden'
            nodeAncestor?.querySelectorAll('.linker-line').forEach((line: SVGPathElement) => line.remove());
            nodeAncestor?.setAttribute('data-ts-head-children-hidden', 'true')
        }
    }

    private removeNodeRecursiveFromTreeMap (node_id: string) {
        const find_node_children = this.tree_map_arr.filter(tree => tree.parentId == node_id);
        find_node_children.forEach(child => {
            this.tree_map_arr.splice(this.tree_map_arr.findIndex(tree => tree.id == child.id), 1);
            this.tree_map_arr.filter(tree => tree.id == child.id).length > 0 && this.removeNodeRecursiveFromTreeMap(child.id);
        });
    }
}

export default HorizontalTreeSpider;