import { TBranchLineOrigin, TTreeClassParams, TTreeMapArr } from "../types/utils";
import ChartMainHelper from "../helpers/chart-helper";
import { IChartHead } from "../types/MainTypes";
import TSElement from "../utils/ts-element";
import * as d3 from 'd3'

class CellarTreeSpider {
    protected content_wrapper: HTMLElement | null = null;
    protected head_child_wrapper_center: HTMLElement | null = null;
    protected head_child_wrapper_1: HTMLElement | null = null;
    protected head_child_wrapper_2: HTMLElement | null = null;

    protected tsInnerContainer: HTMLElement | null = null;

    chartHelper: ChartMainHelper | undefined;

    tree_map_arr: Array<TTreeMapArr> = [];

    current_scale = 1;

    constructor ({tsInnerContainer, chartHelper}: TTreeClassParams) {
        this.tsInnerContainer = tsInnerContainer;

        this.chartHelper = chartHelper;
        this.chartHelper.handleCollapseChildren = this.handleCollapseChildren.bind(this);

        setTimeout(() => {
            this.organizeUI()
        }, 0);
    }

    private organizeUI () {
        this.content_wrapper = this.chartHelper!.createDynamicEl();
        this.head_child_wrapper_center = this.chartHelper!.createDynamicEl();
        this.head_child_wrapper_1 = this.chartHelper!.createDynamicEl();
        this.head_child_wrapper_2 = this.chartHelper!.createDynamicEl();

        this.head_child_wrapper_center.className = "st-child-wrapper"
        this.head_child_wrapper_1.className = "st-child-wrapper"
        this.head_child_wrapper_2.className = "st-child-wrapper"

        this.content_wrapper.className = "st-cs-content-wrapper";

        this.content_wrapper.appendChild(this.head_child_wrapper_1);
        this.content_wrapper.appendChild(this.head_child_wrapper_2);
        this.content_wrapper.appendChild(this.head_child_wrapper_center);

        this.tsInnerContainer?.append(this.content_wrapper);

        this.chartHelper!.set_tmp_tree_data()
        this.map_children_data_to_head();

        this.drawBranchLinkFresh();

        d3.timeout(() => {
            const first_svg_el = (d3.select(`${this.chartHelper!.app_root_unique_selector} .st-root-el > svg`)!.node() as SVGSVGElement)!.getBoundingClientRect();
            this.chartHelper?.center_elem(first_svg_el, "bottom")
        }, 0)
    }

    private map_children_data_to_head (parentSVGEl?: any, parentId?: string, provided_hierarchy?: IChartHead[]) {
        let hierarchies = this.chartHelper!.tmp_tree_data.filter(data => data.parentId == parentId);
        if (!provided_hierarchy) {
            hierarchies = this.chartHelper!.tmp_tree_data.filter(data => data.parentId == parentId);
        }else{
            hierarchies = provided_hierarchy
        }
        
        const childElContainer = this.chartHelper!.createDynamicEl();
        const isElParentRootEl = this.chartHelper!.getIsParentRootEl(parentId as string) && parentId != undefined;

        hierarchies.forEach(head => {
            const head_UI_wrapper = this.chartHelper!.createDynamicEl();
            const get_item_root_item = this.chartHelper!.get_second_ancestor_item(head.id)
            let second_ancestor_rel_pos = get_item_root_item == undefined ? 1 : this.chartHelper!.getElemRelPosInTree(get_item_root_item?.id as string)
            
            const head_UI = this.chartHelper!.makeHead(head as IChartHead, false, {parent: "right", children: parentId == undefined ? "bottom" : second_ancestor_rel_pos % 2 == 0 ? "right" : 'left'});
            head_UI_wrapper.appendChild(head_UI?.node() as SVGSVGElement);
            const root_el_cls = parentId == undefined ? " st-root-el" : ""
            head_UI_wrapper.className = "ts-head-node-wrapper ts-w-id-" + head.id + root_el_cls;
            second_ancestor_rel_pos % 2 == 0 && head_UI_wrapper.classList.add("top")

            if (parentSVGEl === undefined) {
                this.head_child_wrapper_center?.appendChild(head_UI_wrapper);
            }else if (isElParentRootEl) {
                if (this.chartHelper!.getElemRelPosInTree(head.id as string) % 2 == 0) { // el position relative to root parent is even
                    this.head_child_wrapper_1?.appendChild(head_UI_wrapper);
                }else{
                    this.head_child_wrapper_2?.appendChild(head_UI_wrapper);
                }                
            }else{
                childElContainer!.appendChild(head_UI_wrapper);
                second_ancestor_rel_pos % 2 == 0 && childElContainer.classList.add("top");
            }
            
            parentSVGEl != undefined && this.tree_map_arr.push({
                id: head.id, 
                svgNode: parentSVGEl, 
                targetChild: head_UI?.node() as SVGSVGElement, 
                parentId: parentId as string,
                lineOrigin: second_ancestor_rel_pos % 2 == 0 ? "right" : "left"
            });

            if (this.chartHelper?.el_has_children(head.id)) {
                if (isElParentRootEl) {
                    if (this.chartHelper!.getElemRelPosInTree(head.id as string) % 2 == 0) { // el position relative to root parent is even
                        head_UI_wrapper.prepend(this.map_children_data_to_head(head_UI, head.id) as TSElement);
                    }else{
                        head_UI_wrapper.append(this.map_children_data_to_head(head_UI, head.id) as TSElement);
                    }                
                }else{
                    const map_children = this.map_children_data_to_head(head_UI, head.id) as TSElement;
                    second_ancestor_rel_pos % 2 == 0 ?  head_UI_wrapper!.prepend(map_children) : head_UI_wrapper!.appendChild(map_children);
                }
            }

        })

        childElContainer!.classList.add("child-container");
        return childElContainer;
    }

    private drawBranchLinkFresh () {
        this.chartHelper!.rootWrapperContainer?.querySelectorAll('.linker-line').forEach(el => el.remove());
        this.tree_map_arr.forEach(branch => this.drawBranchLink(branch.id, branch.svgNode, branch.targetChild as SVGSVGElement, branch.parentId, branch.lineOrigin));
    }

    private drawBranchLink (id: string, svgNode: any, targetChild: SVGSVGElement, parentId: string, lineOrigin: TBranchLineOrigin = "bottom") {
        const isParentChildrenHidden = this.tsInnerContainer?.querySelector('.ts-w-id-'+parentId)?.getAttribute('data-ts-head-children-hidden');
        if (isParentChildrenHidden === 'true') return;

        const color_set = this.chartHelper?.color_handler.getColor(id as unknown as number);

        const parentIsRoot = this.chartHelper!.getIsParentRootEl(parentId as string);
        
        const elementBounds = targetChild.getBoundingClientRect();
        const svgSourceNodeBounds = svgNode.node().getBoundingClientRect();

        let lineStartX, lineStartY;

        if (parentIsRoot) {
            lineStartX = (svgSourceNodeBounds.width / this.current_scale) / 2 ;
            lineStartY = 0;
        }else{
            lineStartX = lineOrigin == "right" ? 0 : (svgSourceNodeBounds.width / this.current_scale);
            lineStartY = (svgSourceNodeBounds.height / this.current_scale) / 2;
        }

        const lineEndX = ((elementBounds.x + (lineOrigin == "right" ? elementBounds.width : 0)) / this.current_scale) - ((svgSourceNodeBounds.x) / this.current_scale) + 0
        const lineEndY = (((elementBounds.top + (elementBounds.height / 2)) / this.current_scale) - ((svgSourceNodeBounds.top) / this.current_scale))

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
        const nodeParent = svgNode.node()?.parentElement;
        const isRootTreeEl = this.chartHelper!.getIsElRootTreeChild(id);
        const nodeChildrenHidden = nodeParent?.getAttribute('data-ts-head-children-hidden')

        if (isRootTreeEl) {
            return this.handleCollapseRootElChildren(svgNode, id, clicked_pos)
        }
        
        if (!nodeParent?.hasAttribute('data-ts-head-children-hidden') && nodeParent.querySelector('.child-container').innerHTML == '') {
            this.chartHelper!.set_tmp_tree_data(id)
            nodeParent.querySelector('.child-container').remove()

            const remade_children_obj = this.map_children_data_to_head(svgNode, id);
            const get_item_root_item = this.chartHelper!.get_second_ancestor_item(id)
            let second_ancestor_rel_pos = get_item_root_item == undefined ? 1 : this.chartHelper!.getElemRelPosInTree(get_item_root_item?.id as string)
            if (second_ancestor_rel_pos % 2 == 0) {
                nodeParent?.prepend(remade_children_obj);
            }else{
                nodeParent?.appendChild(remade_children_obj);
            }
            nodeParent?.setAttribute('data-ts-head-children-hidden', 'false');            
            this.drawBranchLinkFresh();
        }else if (nodeChildrenHidden == 'true') {
            const childrenContainer = nodeParent?.querySelector('.child-container');
            childrenContainer.style.visibility = ''
            nodeParent?.setAttribute('data-ts-head-children-hidden', 'false');            
            this.drawBranchLinkFresh();
        }else{
            const childrenContainer = nodeParent?.querySelector('.child-container');
            childrenContainer.style.visibility = 'hidden'
            nodeParent?.querySelectorAll('.linker-line').forEach((line: SVGPathElement) => line.remove());
            nodeParent?.setAttribute('data-ts-head-children-hidden', 'true')
        }
    }

    private removeNodeRecursiveFromTreeMap (node_id: string, inclusive?: boolean) {
        const find_node_children = this.tree_map_arr.filter(tree => tree.parentId == node_id);
        find_node_children.forEach(child => {
            this.tree_map_arr.splice(this.tree_map_arr.findIndex(tree => tree.id == child.id), 1);
            this.tree_map_arr.filter(tree => tree.id == child.id).length > 0 && this.removeNodeRecursiveFromTreeMap(child.id);
        });
        if (inclusive) {
            this.tree_map_arr.splice(this.tree_map_arr.findIndex(tree => tree.id == node_id), 1);
        }
    }

    private handleCollapseRootElChildren (svgNode: any, id: string, clicked_pos: number) {
        const nodeParent = svgNode.node()?.parentElement;
        const nodeTopChildrenHidden = nodeParent?.getAttribute('data-ts-head-children-hidden');
        
        if (!nodeTopChildrenHidden || nodeTopChildrenHidden == "false") {
            nodeParent.parentElement.previousElementSibling.style.visibility = 'hidden'
            nodeParent.parentElement.previousElementSibling.previousElementSibling.style.visibility = 'hidden'
            nodeParent.parentElement.previousElementSibling.querySelectorAll('.linker-line').forEach((line: SVGPathElement) => line.remove());
            nodeParent.parentElement.previousElementSibling.previousElementSibling.querySelectorAll('.linker-line').forEach((line: SVGPathElement) => line.remove());
            nodeParent?.setAttribute('data-ts-head-children-hidden', 'true');
        }else{
            nodeParent.parentElement.previousElementSibling.style.visibility = ''
            nodeParent.parentElement.previousElementSibling.previousElementSibling.style.visibility = ''
            nodeParent?.setAttribute('data-ts-head-children-hidden', 'false')
        }
        this.drawBranchLinkFresh();
    }
}

export default CellarTreeSpider;