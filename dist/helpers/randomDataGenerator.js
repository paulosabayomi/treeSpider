import { allFakers } from '../../deps/faker/index.mjs';
class RandomDataGenerator {
    data_length = 50;
    generated_data = [];
    auto_proceed = true;
    locale = "en_GB";
    imgAPIs = ['https://picsum.photos/500/500?random=', 'https://avatar.iran.liara.run/public/'];
    constructor({ length, auto_proceed, locale }) {
        length !== undefined && (this.data_length = length);
        auto_proceed !== undefined && (this.auto_proceed = auto_proceed);
        locale !== undefined && (this.locale = locale);
        if (this.auto_proceed) {
            this.generate();
        }
    }
    generate() {
        return this.make_data();
    }
    make_data() {
        for (let i = 0; i < this.data_length; i++) {
            const _data = this.generate_data((i + 1).toString());
            if (i > 0) {
                const parentId = Math.floor(Math.random() * this.generated_data.length);
                _data.parentId = parentId == 0 ? "1" : parentId.toString();
            }
            this.generated_data.push(_data);
        }
        return this.generated_data;
    }
    generate_data(id) {
        const should_add_image = Math.floor(Math.random() * 2);
        const img_endpoints = this.imgAPIs[Math.floor(Math.random() * this.imgAPIs.length)] + id;
        return {
            id,
            name: allFakers[this.locale].person.fullName(),
            role: allFakers[this.locale].person.jobTitle(),
            location: allFakers[this.locale].location.city() + ", " + allFakers[this.locale].location.country(),
            image: should_add_image ? img_endpoints : ''
        };
    }
}
export default RandomDataGenerator;
