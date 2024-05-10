import ChartMainHelper from "../helpers/chart-helper.js";
class DefaultTree {
    chartHelper;
    tree_data = [];
    tree_map_arr = [];
    hc_d3 = window.d3;
    content_wrapper = null;
    hcInnerContainer = null;
    current_scale = 1;
    constructor({ tree_data, hcInnerContainer }) {
        this.hcInnerContainer = hcInnerContainer;
        this.tree_data = tree_data;
        this.chartHelper = new ChartMainHelper();
        this.chartHelper.tree_data = tree_data;
        this.chartHelper.handleCollapseChildren = this.handleCollapseChildren.bind(this);
        setTimeout(() => {
            this.organizeUI();
        }, 0);
    }
    map_children_data_to_head(parentSVGEl, parentId) {
        const hierarchies = this.tree_data.filter(data => data.parentId == parentId);
        const childElContainer = this.chartHelper.createDynamicEl();
        hierarchies.forEach(head => {
            const head_UI_wrapper = this.chartHelper.createDynamicEl();
            const head_UI = this.chartHelper.makeHead(head);
            head_UI_wrapper.appendChild(head_UI?.node());
            const root_el_cls = parentId == undefined ? " st-root-el" : "";
            head_UI_wrapper.className = "hc-head-node-wrapper hc-w-id-" + head.id + root_el_cls;
            childElContainer.appendChild(head_UI_wrapper);
            const has_childs = this.tree_data.filter(data => data.parentId == head.id).length > 0;
            parentSVGEl != undefined && this.tree_map_arr.push({ id: head.id, svgNode: parentSVGEl, targetChild: head_UI_wrapper, parentId: parentId });
            if (has_childs) {
                head_UI_wrapper.append(this.map_children_data_to_head(head_UI, head.id));
            }
        });
        childElContainer.className = "hc-head-wrapper child-container";
        if (parentSVGEl === undefined)
            this.content_wrapper?.appendChild(childElContainer);
        return childElContainer;
    }
    organizeUI() {
        this.content_wrapper = this.chartHelper.createDynamicEl();
        this.content_wrapper.className = "hc-head-wrapper";
        this.map_children_data_to_head();
        this.hcInnerContainer.appendChild(this.content_wrapper);
        this.drawBranchLinkFresh();
    }
    drawBranchLinkFresh() {
        document.querySelectorAll('.linker-line').forEach(el => el.remove());
        this.tree_map_arr.forEach(branch => this.drawBranchLink(branch.svgNode, branch.targetChild, branch.parentId));
    }
    drawBranchLink(svgNode, targetChild, parentId) {
        const isParentChildrenHidden = this.hcInnerContainer?.querySelector('.hc-w-id-' + parentId)?.getAttribute('data-hc-head-children-hidden');
        if (isParentChildrenHidden === 'true')
            return;
        const elementBounds = targetChild.getBoundingClientRect();
        const svgSourceNodeBounds = svgNode.node().getBoundingClientRect();
        const lineStartX = (svgSourceNodeBounds.width / this.current_scale) / 2;
        const lineStartY = svgSourceNodeBounds.height / this.current_scale;
        const lineEndX = (elementBounds.x / this.current_scale - svgSourceNodeBounds.x / this.current_scale) + (targetChild.clientWidth / 2);
        const lineEndY = (elementBounds.top / this.current_scale) - (svgSourceNodeBounds.top / this.current_scale);
        const lineMove1X = lineStartX + (lineEndX * 0.18);
        const lineMove1Y = lineStartY + (lineEndY * 0.15);
        const lineMove2X = lineEndX * 0.75;
        const lineMove2Y = lineEndY * 0.75;
        const link = this.hc_d3.line()
            .curve(this.hc_d3.curveNatural);
        const lineCurveData = [
            [lineMove1X, lineMove1Y],
            [lineMove2X, lineMove2Y],
        ];
        const data = [
            [lineStartX, lineStartY],
            ...lineCurveData,
            [lineEndX, lineEndY],
        ];
        svgNode?.append('path')
            .attr('d', link(data))
            .attr('fill', 'none')
            .attr('class', 'linker-line')
            .attr('stroke-width', 1)
            .attr('style', 'z-index: -1');
    }
    handleCollapseChildren(svgNode, id, clicked_pos) {
        const nodeAncestor = svgNode.node()?.parentElement;
        const nodeChildrenHidden = nodeAncestor?.getAttribute('data-hc-head-children-hidden');
        if (nodeChildrenHidden == 'true') {
            const remade_children_obj = this.map_children_data_to_head(svgNode, id);
            nodeAncestor?.appendChild(remade_children_obj);
            nodeAncestor?.setAttribute('data-hc-head-children-hidden', 'false');
        }
        else {
            const childrenContainer = nodeAncestor?.querySelector('.child-container');
            childrenContainer?.remove();
            nodeAncestor?.querySelectorAll('.linker-line').forEach((line) => line.remove());
            nodeAncestor?.setAttribute('data-hc-head-children-hidden', 'true');
            this.removeNodeRecursiveFromTreeMap(id);
        }
        this.drawBranchLinkFresh();
    }
    removeNodeRecursiveFromTreeMap(node_id) {
        const find_node_children = this.tree_map_arr.filter(tree => tree.parentId == node_id);
        find_node_children.forEach(child => {
            this.tree_map_arr.splice(this.tree_map_arr.findIndex(tree => tree.id == child.id), 1);
            this.tree_map_arr.filter(tree => tree.id == child.id).length > 0 && this.removeNodeRecursiveFromTreeMap(child.id);
        });
    }
}
export default DefaultTree;
