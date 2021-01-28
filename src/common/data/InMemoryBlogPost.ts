import { BlogPost } from './index';

export default class InMemoryBlogPost implements BlogPost {
	get title(): string { return "in memory blog post test "; }
}
